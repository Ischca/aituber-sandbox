import type { WSMessage } from "@/types/websocket";

type EventListener<T extends WSMessage["type"]> = (
  data: Extract<WSMessage, { type: T }>
) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<EventListener<any>>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1秒

  constructor(private url: string) {}

  /**
   * WebSocket 接続を確立
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // 既に接続済み
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("[WebSocket] Connected");
        this.reconnectAttempts = 0; // リセット
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          this.notifyListeners(message.type, message);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        this.ws = null;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };
    } catch (error) {
      console.error("[WebSocket] Failed to connect:", error);
      this.scheduleReconnect();
    }
  }

  /**
   * 再接続をスケジュール（exponential backoff）
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[WebSocket] Max reconnect attempts reached. Giving up."
      );
      return;
    }

    const delay =
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * 接続を切断
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * イベントリスナーを登録
   */
  on<T extends WSMessage["type"]>(
    type: T,
    callback: EventListener<T>
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /**
   * イベントリスナーを解除
   */
  off<T extends WSMessage["type"]>(
    type: T,
    callback: EventListener<T>
  ): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * リスナーに通知
   */
  private notifyListeners(type: string, data: WSMessage): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * 接続状態を取得
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
