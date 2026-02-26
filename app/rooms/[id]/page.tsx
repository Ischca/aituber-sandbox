"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchRoom, startSession, stopSession } from "@/lib/api";
import type { Room } from "@/types/room";
import type { Scenario } from "@/types/scenario";
import { ChatPanel } from "@/components/chat/chat-panel";
import { RoomStatusBadge } from "@/components/room/room-status";
import { ScenarioSelector } from "@/components/scenario/scenario-selector";
import { ScenarioPlayer } from "@/components/scenario/scenario-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (id) {
      loadRoom();
    }
  }, [id]);

  async function loadRoom() {
    setLoading(true);
    setError(null);
    const result = await fetchRoom(id);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setRoom(result.data);
    }
    setLoading(false);
  }

  async function handleStart() {
    setActionLoading(true);
    const result = await startSession(id);
    if (result.data) setRoom(result.data);
    setActionLoading(false);
  }

  async function handleStop() {
    setActionLoading(true);
    const result = await stopSession(id);
    if (result.data) setRoom(result.data);
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-destructive">エラーが発生しました: {error || "ルームが見つかりません"}</p>
        <Button asChild className="mt-4">
          <a href="/rooms">
            <ArrowLeft className="h-4 w-4 mr-1" />
            ルーム一覧に戻る
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <a href="/rooms">
            <ArrowLeft className="h-4 w-4 mr-1" />
            ルーム一覧に戻る
          </a>
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <RoomStatusBadge status={room.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">{room.liveChatId}</p>
        </div>
        <div>
          {room.status !== "active" ? (
            <Button onClick={handleStart} disabled={actionLoading}>
              {actionLoading ? "開始中..." : "セッション開始"}
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleStop} disabled={actionLoading}>
              {actionLoading ? "停止中..." : "セッション停止"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {room.status === "active" ? (
            <ChatPanel roomId={room.id} liveChatId={room.liveChatId} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    セッションを開始するとチャットが表示されます
                  </p>
                  <Button onClick={handleStart} disabled={actionLoading}>
                    セッション開始
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          {/* サイドバー: ルーム情報、コントロール */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ルーム情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ルームID</p>
                <p className="text-sm font-mono">{room.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Chat ID</p>
                <p className="text-sm font-mono break-all">{room.liveChatId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ステータス</p>
                <div className="mt-1">
                  <RoomStatusBadge status={room.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">作成日時</p>
                <p className="text-sm">{new Date(room.createdAt).toLocaleString("ja-JP")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AITuber 接続設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">stream.toml に以下を追加:</p>
              <code className="block rounded bg-secondary px-2 py-1 text-xs break-all">
                base_url = &quot;{typeof window !== "undefined" ? window.location.origin : ""}&quot;
              </code>
              <code className="block rounded bg-secondary px-2 py-1 text-xs break-all">
                live_chat_id = &quot;{room.liveChatId}&quot;
              </code>
            </CardContent>
          </Card>

          {/* シナリオ選択・再生 */}
          {room.status === "active" && (
            <>
              {!selectedScenario ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">シナリオテスト</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScenarioSelector onSelect={setSelectedScenario} />
                  </CardContent>
                </Card>
              ) : (
                <ScenarioPlayer
                  roomId={room.id}
                  scenario={selectedScenario}
                  onStop={() => setSelectedScenario(null)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
