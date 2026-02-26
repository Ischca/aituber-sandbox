"use client";

import type { PollingMetrics } from "@/types/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  metrics: PollingMetrics | null;
}

export function ConnectionStatus({ metrics }: ConnectionStatusProps) {
  // 接続状態を判定
  const now = Date.now();
  const timeSinceLastPoll = metrics ? now - metrics.lastPollAt : Infinity;

  let status: "connected" | "waiting" | "disconnected";
  let statusText: string;
  let badgeVariant: "default" | "secondary" | "destructive";

  if (timeSinceLastPoll < 5000) {
    status = "connected";
    statusText = "接続中";
    badgeVariant = "default";
  } else if (timeSinceLastPoll < 30000) {
    status = "waiting";
    statusText = "応答待ち";
    badgeVariant = "secondary";
  } else {
    status = "disconnected";
    statusText = "未接続";
    badgeVariant = "destructive";
  }

  // 最終ポーリング時刻をフォーマット
  const formatLastPoll = (timestamp: number): string => {
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    return `${hours}時間前`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>接続状態</span>
          <Badge variant={badgeVariant}>{statusText}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">最終ポーリング</p>
            <p className="text-lg font-semibold">
              {metrics ? formatLastPoll(metrics.lastPollAt) : "データなし"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ポーリング間隔</p>
            <p className="text-lg font-semibold">
              {metrics ? `${metrics.averageIntervalMs.toFixed(0)} ms` : "データなし"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
