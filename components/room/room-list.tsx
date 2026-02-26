"use client";

import { useEffect, useState } from "react";
import { useRoomStore } from "@/stores/room-store";
import { fetchRooms, deleteRoom as deleteRoomApi } from "@/lib/api";
import type { Room } from "@/types/room";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomStatusBadge } from "./room-status";
import { RoomCreateDialog } from "./room-create-dialog";
import { Trash2, ExternalLink } from "lucide-react";

export function RoomListClient() {
  const { rooms, loading, setRooms, removeRoom, setLoading } = useRoomStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setLoading(true);
    setError(null);
    const result = await fetchRooms();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setRooms(result.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("このルームを削除してもよろしいですか？")) {
      return;
    }

    const result = await deleteRoomApi(id);
    if (result.error) {
      alert(`削除に失敗しました: ${result.error}`);
    } else {
      removeRoom(id);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">エラーが発生しました: {error}</p>
        <Button onClick={loadRooms}>再試行</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rooms.length} 件のルーム
        </p>
        <RoomCreateDialog onCreated={loadRooms} />
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-muted-foreground">ルームがありません</p>
            <RoomCreateDialog onCreated={loadRooms} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <RoomStatusBadge status={room.status} />
                </div>
                <CardDescription className="font-mono text-xs">
                  {room.liveChatId}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <a href={`/rooms/${room.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    開く
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
