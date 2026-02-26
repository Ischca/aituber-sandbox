"use client";

import { useEffect, useState, useRef } from "react";
import { CommentList } from "./comment-list";
import { CommentInput } from "./comment-input";
import { SuperChatButton } from "./super-chat-button";
import { useChatStore } from "@/stores/chat-store";
import { WebSocketClient } from "@/lib/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatPanelProps {
  roomId: string;
  liveChatId: string;
}

export function ChatPanel({ roomId, liveChatId }: ChatPanelProps) {
  const { comments, metrics, connected, addComment, setMetrics, setConnected } =
    useChatStore();
  const [author, setAuthor] = useState("");
  const wsClientRef = useRef<WebSocketClient | null>(null);

  // ローカルストレージから著者名を取得
  useEffect(() => {
    const savedAuthor = localStorage.getItem("chat-author");
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  // WebSocket 接続
  useEffect(() => {
    // WebSocket URL: Durable Object への接続
    // ViNext では worker エンドポイント経由でアクセス
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
      window.location.host
    }/api/ws/${liveChatId}`;

    const client = new WebSocketClient(wsUrl);
    wsClientRef.current = client;

    // イベントリスナー登録
    client.on("comment_added", (data) => {
      addComment(data.comment);
    });

    client.on("metrics_update", (data) => {
      setMetrics(data.metrics);
    });

    // 接続開始
    client.connect();

    // 接続状態監視
    const checkConnection = setInterval(() => {
      setConnected(client.isConnected);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      client.disconnect();
    };
  }, [liveChatId, addComment, setMetrics, setConnected]);

  // コメント送信ハンドラ
  const handleSendComment = async (
    author: string,
    text: string,
    isMember: boolean
  ) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          text,
          isMember,
          isModerator: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send comment");
      }
    } catch (error) {
      console.error("Failed to send comment:", error);
    }
  };

  // スパチャ送信ハンドラ
  const handleSendSuperChat = async (
    author: string,
    text: string,
    amount: number
  ) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          text,
          isMember: false,
          isModerator: false,
          superChatAmount: amount,
          superChatCurrency: "JPY",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send super chat");
      }
    } catch (error) {
      console.error("Failed to send super chat:", error);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-background/95 backdrop-blur">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">ライブチャット</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={connected ? "default" : "destructive"}>
              {connected ? "接続中" : "切断"}
            </Badge>
            {metrics && (
              <span className="text-xs text-muted-foreground">
                {metrics.messageCount} コメント
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <CommentList comments={comments} />
        <div className="flex-shrink-0 space-y-2 p-4 border-t">
          <SuperChatButton
            roomId={roomId}
            author={author}
            onSend={handleSendSuperChat}
          />
        </div>
        <CommentInput roomId={roomId} onSend={handleSendComment} />
      </CardContent>
    </Card>
  );
}
