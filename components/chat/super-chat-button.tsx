"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SuperChatButtonProps {
  roomId: string;
  author: string;
  onSend: (author: string, text: string, amount: number) => void;
}

const SUPER_CHAT_PRESETS = [
  { amount: 200, label: "¥200" },
  { amount: 500, label: "¥500" },
  { amount: 1000, label: "¥1,000" },
  { amount: 5000, label: "¥5,000" },
  { amount: 10000, label: "¥10,000" },
  { amount: 50000, label: "¥50,000" },
];

export function SuperChatButton({
  roomId,
  author,
  onSend,
}: SuperChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!author.trim() || selectedAmount === null) {
      return;
    }

    onSend(author.trim(), message.trim() || "スーパーチャット！", selectedAmount);
    setMessage("");
    setSelectedAmount(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
      >
        💰 スーパーチャットを送る
      </Button>
    );
  }

  return (
    <Card className="border-yellow-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">スーパーチャット</CardTitle>
        <CardDescription>金額を選択してメッセージを送信</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {SUPER_CHAT_PRESETS.map((preset) => (
            <Button
              key={preset.amount}
              variant={selectedAmount === preset.amount ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAmount(preset.amount)}
              className={
                selectedAmount === preset.amount
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Input
          placeholder="メッセージ（任意）"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={!author.trim() || selectedAmount === null}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            送信
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              setSelectedAmount(null);
              setMessage("");
            }}
            variant="outline"
          >
            キャンセル
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
