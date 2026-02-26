"use client";

import { useEffect, useState } from "react";
import { CommentList } from "@/components/chat/comment-list";
import { CommentInput } from "@/components/chat/comment-input";
import { SuperChatButton } from "@/components/chat/super-chat-button";
import { ViewerChatHeader } from "./viewer-chat-header";
import { useChatStore } from "@/stores/chat-store";
import { useChatPolling } from "@/hooks/use-chat-polling";
import { toYouTubeMessage } from "@/lib/chat-helpers";
import type { CommentResponse } from "@/lib/chat-helpers";

interface ViewerChatPanelProps {
  roomId: string;
  liveChatId: string;
}

export function ViewerChatPanel({ roomId, liveChatId }: ViewerChatPanelProps) {
  const { comments, connected, addComment } = useChatStore();
  const [author, setAuthor] = useState("");

  useChatPolling(liveChatId);

  useEffect(() => {
    const savedAuthor = localStorage.getItem("chat-author");
    if (savedAuthor) setAuthor(savedAuthor);
  }, []);

  const handleSendComment = async (
    author: string,
    text: string,
    isMember: boolean
  ) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text, isMember, isModerator: false }),
      });
      if (!response.ok) throw new Error("Failed to send comment");
      const data = (await response.json()) as CommentResponse;
      addComment(toYouTubeMessage(data, liveChatId));
    } catch (error) {
      console.error("Failed to send comment:", error);
    }
  };

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
      if (!response.ok) throw new Error("Failed to send super chat");
      const data = (await response.json()) as CommentResponse;
      addComment(toYouTubeMessage(data, liveChatId));
    } catch (error) {
      console.error("Failed to send super chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-xl bg-background overflow-hidden">
      <ViewerChatHeader connected={connected} commentCount={comments.length} />
      <div className="flex-1 overflow-hidden">
        <CommentList comments={comments} />
      </div>
      <div className="flex-shrink-0 space-y-2 px-3 py-2 border-t">
        <SuperChatButton
          roomId={roomId}
          author={author}
          onSend={handleSendSuperChat}
        />
      </div>
      <CommentInput roomId={roomId} onSend={handleSendComment} />
    </div>
  );
}
