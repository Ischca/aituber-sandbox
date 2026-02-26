"use client";

import { useEffect, useState } from "react";
import { fetchRooms } from "@/lib/api";
import { WebSocketClient } from "@/lib/websocket";
import { ConnectionStatus } from "./connection-status";
import { PollingMetricsDisplay } from "./polling-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/room";
import type { PollingMetrics } from "@/types/websocket";

export function DashboardContent() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeMetrics, setActiveMetrics] = useState<Map<string, PollingMetrics>>(new Map());
  const [wsClients, setWsClients] = useState<Map<string, WebSocketClient>>(new Map());
  const [loading, setLoading] = useState(true);

  // ルーム一覧を取得
  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      const result = await fetchRooms();
      if (result.data) {
        setRooms(result.data);
      }
      setLoading(false);
    }
    loadRooms();

    // 定期的に更新
    const interval = setInterval(loadRooms, 10000); // 10秒ごと
    return () => clearInterval(interval);
  }, []);

  // アクティブなルームの WebSocket に接続
  useEffect(() => {
    const activeRooms = rooms.filter((room) => room.status === "active");
    const newClients = new Map<string, WebSocketClient>();

    // 新しいアクティブルームに接続
    for (const room of activeRooms) {
      if (!wsClients.has(room.id)) {
        const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/rooms/${room.id}/ws`;
        const client = new WebSocketClient(wsUrl);

        // メトリクス更新リスナー
        client.on("metrics_update", (message) => {
          setActiveMetrics((prev) => {
            const next = new Map(prev);
            next.set(room.id, message.metrics);
            return next;
          });
        });

        client.connect();
        newClients.set(room.id, client);
      } else {
        newClients.set(room.id, wsClients.get(room.id)!);
      }
    }

    // 非アクティブになったルームの接続を切断
    for (const [roomId, client] of wsClients.entries()) {
      if (!newClients.has(roomId)) {
        client.disconnect();
        setActiveMetrics((prev) => {
          const next = new Map(prev);
          next.delete(roomId);
          return next;
        });
      }
    }

    setWsClients(newClients);

    return () => {
      // クリーンアップ
      for (const client of newClients.values()) {
        client.disconnect();
      }
    };
  }, [rooms]);

  const activeRooms = rooms.filter((room) => room.status === "active");
  const idleRooms = rooms.filter((room) => room.status === "idle");
  const stoppedRooms = rooms.filter((room) => room.status === "stopped");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* サマリーセクション */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">総ルーム数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{rooms.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">アクティブルーム</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {activeRooms.length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">実行中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">待機中ルーム</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              {idleRooms.length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">待機中</p>
          </CardContent>
        </Card>
      </div>

      {/* アクティブルームのメトリクス */}
      {activeRooms.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">アクティブルームのメトリクス</h2>
          {activeRooms.map((room) => {
            const metrics = activeMetrics.get(room.id) || null;
            return (
              <div key={room.id} className="space-y-4 rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ルーム ID: {room.id}
                    </p>
                  </div>
                  <Badge variant="default">実行中</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <ConnectionStatus metrics={metrics} />
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">クイックアクション</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
                          <a href={`/rooms/${room.id}`}>チャットルームを開く</a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-4">
                  <PollingMetricsDisplay metrics={metrics} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>アクティブなルームがありません</CardTitle>
            <CardDescription>
              ルームを作成してセッションを開始すると、ここにメトリクスが表示されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/rooms">新しいルームを作成</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ルーム一覧 */}
      {rooms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">全ルーム一覧</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    <Badge
                      variant={
                        room.status === "active"
                          ? "default"
                          : room.status === "idle"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {room.status === "active"
                        ? "実行中"
                        : room.status === "idle"
                          ? "待機中"
                          : "停止"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    作成: {new Date(room.createdAt).toLocaleString("ja-JP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={`/rooms/${room.id}`}>開く</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
