"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchRoom, startSession, stopSession, updateRoom } from "@/lib/api";
import type { Room } from "@/types/room";
import type { Scenario } from "@/types/scenario";
import { ChatPanel } from "@/components/chat/chat-panel";
import { RoomStatusBadge } from "@/components/room/room-status";
import { ScenarioSelector } from "@/components/scenario/scenario-selector";
import { ScenarioPlayer } from "@/components/scenario/scenario-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [streamTitle, setStreamTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [saving, setSaving] = useState(false);

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
      setStreamTitle(result.data.streamTitle || "");
      setChannelName(result.data.channelName || "");
      setStreamUrl(result.data.streamUrl || "");
      setStreamDescription(result.data.description || "");
    }
    setLoading(false);
  }

  async function handleSaveStream() {
    setSaving(true);
    const result = await updateRoom(id, {
      streamTitle: streamTitle || undefined,
      channelName: channelName || undefined,
      streamUrl: streamUrl || undefined,
      description: streamDescription || undefined,
    });
    if (result.data) setRoom(result.data);
    setSaving(false);
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
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/watch/${room.liveChatId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              視聴者ページ
            </a>
          </Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ストリーム設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">配信タイトル</label>
                <Input
                  placeholder="配信タイトル"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">チャンネル名</label>
                <Input
                  placeholder="チャンネル名"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">HLS URL</label>
                <Input
                  placeholder="http://localhost:8888/stream/live/index.m3u8"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">説明</label>
                <textarea
                  placeholder="配信の説明..."
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  maxLength={5000}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={handleSaveStream} disabled={saving} className="w-full" size="sm">
                {saving ? "保存中..." : "保存"}
              </Button>
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
