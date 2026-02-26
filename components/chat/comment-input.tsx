"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommentInputProps {
  roomId: string;
  onSend: (author: string, text: string, isMember: boolean) => void;
}

export function CommentInput({ roomId, onSend }: CommentInputProps) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [isMember, setIsMember] = useState(false);

  // ローカルストレージから著者名を復元
  useEffect(() => {
    const savedAuthor = localStorage.getItem("chat-author");
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  // 著者名を保存
  const saveAuthor = (name: string) => {
    setAuthor(name);
    localStorage.setItem("chat-author", name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !message.trim()) {
      return;
    }

    onSend(author.trim(), message.trim(), isMember);
    setMessage(""); // メッセージのみクリア
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="表示名"
          value={author}
          onChange={(e) => saveAuthor(e.target.value)}
          className="w-32 flex-shrink-0"
        />
        <Input
          placeholder="メッセージを入力..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!author.trim() || !message.trim()}>
          送信
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isMember}
            onChange={(e) => setIsMember(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span>メンバーとして送信</span>
        </label>
      </div>
    </form>
  );
}
