"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchRoomByLiveChatId } from "@/lib/api";
import { ViewerPage } from "@/components/viewer/viewer-page";
import type { Room } from "@/types/room";

export default function WatchPage() {
  const params = useParams();
  const liveChatId = params?.liveChatId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveChatId) return;

    async function loadRoom() {
      setLoading(true);
      const result = await fetchRoomByLiveChatId(liveChatId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setRoom(result.data);
      }
      setLoading(false);
    }

    loadRoom();
  }, [liveChatId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-48px)]">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-4">
        <p className="text-destructive">
          {error || "ルームが見つかりません"}
        </p>
        <a href="/" className="text-sm text-primary hover:underline">
          トップに戻る
        </a>
      </div>
    );
  }

  return <ViewerPage room={room} />;
}
