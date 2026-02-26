"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ViewerChatHeaderProps {
  connected: boolean;
  commentCount: number;
}

export function ViewerChatHeader({ connected, commentCount }: ViewerChatHeaderProps) {
  const [mode, setMode] = useState<"top" | "live">("live");

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setMode("top")}
          className={`text-xs px-2 py-1 rounded ${mode === "top" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          Top Chat
        </button>
        <button
          onClick={() => setMode("live")}
          className={`text-xs px-2 py-1 rounded ${mode === "live" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          Live Chat
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{commentCount}</span>
        <Badge
          variant={connected ? "default" : "destructive"}
          className="text-[10px] px-1.5 py-0"
        >
          {connected ? "接続中" : "切断"}
        </Badge>
      </div>
    </div>
  );
}
