// ============================================================
// Cloudflare Workers デプロイ専用の Durable Object
// ローカル開発では devStore (lib/dev-store.ts) が同等の機能を提供する
// ============================================================

import { DurableObject } from "cloudflare:workers";

interface Comment {
  id: string;
  author: string;
  authorChannelId: string;
  text: string;
  publishedAt: number; // Unix timestamp ms
  isMember: boolean;
  isModerator: boolean;
  superChatAmount?: number;
  superChatCurrency?: string;
}

interface PollingMetrics {
  totalPolls: number;
  lastPollAt: number;
  pollIntervals: number[]; // 直近20回の間隔（ms）
  messageCount: number;
}

interface YouTubeLiveChatMessage {
  kind: string;
  id: string;
  snippet: {
    type: string;
    liveChatId: string;
    publishedAt: string;
    displayMessage: string;
    superChatDetails?: {
      amountMicros: string;
      currency: string;
      amountDisplayString: string;
    };
  };
  authorDetails: {
    channelId: string;
    displayName: string;
    profileImageUrl: string;
    isChatModerator: boolean;
    isChatOwner: boolean;
    isChatSponsor: boolean;
  };
}

interface BroadcastMessage {
  type: "comment_added" | "metrics_update";
  comment?: YouTubeLiveChatMessage;
  metrics?: ReturnType<RoomObject["getMetricsSummary"]>;
}

export class RoomObject extends DurableObject {
  private comments: Comment[] = [];
  private metrics: PollingMetrics = { totalPolls: 0, lastPollAt: 0, pollIntervals: [], messageCount: 0 };
  private sessions: Set<WebSocket> = new Set();
  private scenarioTimer: number | null = null; // alarm用

  constructor(ctx: DurableObjectState, env: Record<string, unknown>) {
    super(ctx, env);
  }

  // コメント追加
  async addComment(comment: Omit<Comment, "id" | "publishedAt">): Promise<Comment> {
    const fullComment: Comment = {
      ...comment,
      id: crypto.randomUUID(),
      publishedAt: Date.now(),
    };
    this.comments.push(fullComment);
    this.metrics.messageCount++;

    // WebSocket で全セッションに通知
    this.broadcast({ type: "comment_added", comment: this.toYouTubeFormat(fullComment) });

    return fullComment;
  }

  // pageToken 以降のコメントを取得（YouTube API 互換）
  async getComments(pageToken?: string): Promise<{ comments: Comment[]; nextPageToken: string }> {
    // pageToken はタイムスタンプ（ミリ秒）をbase64エンコードした文字列
    const after = pageToken ? parseInt(atob(pageToken), 10) : 0;
    const filtered = this.comments.filter(c => c.publishedAt > after);
    const nextToken = filtered.length > 0
      ? btoa(String(filtered[filtered.length - 1].publishedAt))
      : pageToken || btoa("0");

    // ポーリングメトリクス更新
    const now = Date.now();
    if (this.metrics.lastPollAt > 0) {
      this.metrics.pollIntervals.push(now - this.metrics.lastPollAt);
      if (this.metrics.pollIntervals.length > 20) this.metrics.pollIntervals.shift();
    }
    this.metrics.totalPolls++;
    this.metrics.lastPollAt = now;

    // メトリクス更新を通知
    this.broadcast({ type: "metrics_update", metrics: this.getMetricsSummary() });

    return { comments: filtered, nextPageToken: nextToken };
  }

  // YouTube API v3 フォーマットに変換
  private toYouTubeFormat(comment: Comment): YouTubeLiveChatMessage {
    // YouTubeLiveChatMessage 形式に変換
    const item: YouTubeLiveChatMessage = {
      kind: "youtube#liveChatMessage",
      id: comment.id,
      snippet: {
        type: comment.superChatAmount ? "superChatEvent" : "textMessageEvent",
        liveChatId: "", // 呼び出し側で設定
        publishedAt: new Date(comment.publishedAt).toISOString(),
        displayMessage: comment.text,
      },
      authorDetails: {
        channelId: comment.authorChannelId,
        displayName: comment.author,
        profileImageUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(comment.author)}`,
        isChatModerator: comment.isModerator,
        isChatOwner: false,
        isChatSponsor: comment.isMember,
      },
    };

    if (comment.superChatAmount) {
      item.snippet.superChatDetails = {
        amountMicros: String(comment.superChatAmount * 1_000_000),
        currency: comment.superChatCurrency || "JPY",
        amountDisplayString: `¥${comment.superChatAmount.toLocaleString()}`,
      };
    }

    return item;
  }

  private getMetricsSummary() {
    const intervals = this.metrics.pollIntervals;
    const avg = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    return {
      totalPolls: this.metrics.totalPolls,
      averageIntervalMs: Math.round(avg),
      lastPollAt: this.metrics.lastPollAt,
      messageCount: this.metrics.messageCount,
    };
  }

  // WebSocket ハンドリング
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket アップグレード
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      this.sessions.add(server);

      return new Response(null, { status: 101, webSocket: client });
    }

    // REST API（内部通信用）
    if (url.pathname.endsWith("/comments") && request.method === "POST") {
      const body = await request.json() as Omit<Comment, "id" | "publishedAt">;
      const comment = await this.addComment(body);
      return Response.json(comment);
    }

    if (url.pathname.endsWith("/poll") && request.method === "GET") {
      const pageToken = url.searchParams.get("pageToken") || undefined;
      const result = await this.getComments(pageToken);
      return Response.json(result);
    }

    if (url.pathname.endsWith("/metrics") && request.method === "GET") {
      return Response.json(this.getMetricsSummary());
    }

    return new Response("Not Found", { status: 404 });
  }

  private broadcast(message: BroadcastMessage) {
    const data = JSON.stringify(message);
    for (const ws of this.sessions) {
      try {
        ws.send(data);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }

  // Durable Objects WebSocket イベント
  webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws);
  }

  webSocketError(ws: WebSocket) {
    this.sessions.delete(ws);
  }

  // リセット
  async reset() {
    this.comments = [];
    this.metrics = { totalPolls: 0, lastPollAt: 0, pollIntervals: [], messageCount: 0 };
  }
}
