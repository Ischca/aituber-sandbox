"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import type { YouTubeLiveChatMessageListResponse } from "@/types/youtube";

export function useChatPolling(liveChatId: string) {
  const pageTokenRef = useRef<string>("");

  useEffect(() => {
    const { addComment, setConnected } = useChatStore.getState();

    const pollMessages = async () => {
      try {
        const url = new URL(`/youtube/v3/liveChat/messages`, window.location.origin);
        url.searchParams.set("liveChatId", liveChatId);
        if (pageTokenRef.current) {
          url.searchParams.set("pageToken", pageTokenRef.current);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json() as YouTubeLiveChatMessageListResponse;

        const existingIds = new Set(useChatStore.getState().comments.map(c => c.id));
        const newComments = data.items.filter(item => !existingIds.has(item.id));

        for (const comment of newComments) {
          addComment(comment);
        }

        if (data.nextPageToken) {
          pageTokenRef.current = data.nextPageToken;
        }

        setConnected(true);
      } catch (error) {
        console.error("Failed to poll messages:", error);
        setConnected(false);
      }
    };

    pollMessages();
    const intervalId = setInterval(pollMessages, 2000);
    return () => clearInterval(intervalId);
  }, [liveChatId]);
}
