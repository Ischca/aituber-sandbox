"use client";

import { useEffect, useState } from "react";
import { CommentList } from "./comment-list";
import { CommentInput } from "./comment-input";
import { SuperChatButton } from "./super-chat-button";
import { useChatStore } from "@/stores/chat-store";
import { useChatPolling } from "@/hooks/use-chat-polling";
import { toYouTubeMessage } from "@/lib/chat-helpers";
import type { CommentResponse } from "@/lib/chat-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatPanelProps {
  roomId: string;
  liveChatId: string;
}

export function ChatPanel({ roomId, liveChatId }: ChatPanelProps) {
  const { comments, connected, addComment } = useChatStore();
  const [author, setAuthor] = useState("");

  useChatPolling(liveChatId);

  // ローカルストレージから著者名を取得
  useEffect(() => {
    const savedAuthor = localStorage.getItem("chat-author");
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

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

      const data = await response.json() as CommentResponse;
      addComment(toYouTubeMessage(data, liveChatId));
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

      const data = await response.json() as CommentResponse;
      addComment(toYouTubeMessage(data, liveChatId));
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
              {connected ? "オンライン" : "切断"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {comments.length} コメント
            </span>
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
