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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createRoom({ name });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setName("");
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
          <div className="py-4">
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
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
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
