"use client";

import { useState } from "react";
import { createRoom } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface RoomCreateDialogProps {
  onCreated?: () => void;
}

export function RoomCreateDialog({ onCreated }: RoomCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [showStream, setShowStream] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createRoom({
      name,
      ...(showStream && {
        streamTitle: streamTitle || undefined,
        channelName: channelName || undefined,
        description: description || undefined,
      }),
    });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setName("");
      setStreamTitle("");
      setChannelName("");
      setDescription("");
      setShowStream(false);
      setOpen(false);
      setLoading(false);
      onCreated?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          新規ルーム
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新規ルーム作成</DialogTitle>
            <DialogDescription>
              テスト用のチャットルームを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="room-name" className="block text-sm font-medium mb-2">
                ルーム名
              </label>
              <Input
                id="room-name"
                placeholder="例: テストルーム 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStream}
                  onChange={(e) => setShowStream(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                ストリーム設定
              </label>
            </div>

            {showStream && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div>
                  <label htmlFor="stream-title" className="block text-sm font-medium mb-1">
                    配信タイトル
                  </label>
                  <Input
                    id="stream-title"
                    placeholder="例: 雑談配信"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    disabled={loading}
                    maxLength={200}
                  />
                </div>
                <div>
                  <label htmlFor="channel-name" className="block text-sm font-medium mb-1">
                    チャンネル名
                  </label>
                  <Input
                    id="channel-name"
                    placeholder="例: テストチャンネル"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    説明
                  </label>
                  <textarea
                    id="description"
                    placeholder="配信の説明..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    maxLength={5000}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                キャンセル
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
