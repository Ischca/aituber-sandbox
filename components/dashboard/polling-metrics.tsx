"use client";

import type { PollingMetrics } from "@/types/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PollingMetricsDisplayProps {
  metrics: PollingMetrics | null;
}

export function PollingMetricsDisplay({ metrics }: PollingMetricsDisplayProps) {
  // 相対時刻フォーマット
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    return `${hours}時間前`;
  };

  if (!metrics) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">総ポーリング回数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均ポーリング間隔</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最終ポーリング</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-muted-foreground">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">コメント処理数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-muted-foreground">-</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">総ポーリング回数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{metrics.totalPolls}</p>
          <p className="mt-2 text-sm text-muted-foreground">回</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">平均ポーリング間隔</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {metrics.averageIntervalMs.toFixed(0)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">ms</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最終ポーリング</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {formatRelativeTime(metrics.lastPollAt)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(metrics.lastPollAt).toLocaleTimeString("ja-JP")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">コメント処理数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{metrics.messageCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">件</p>
        </CardContent>
      </Card>
    </div>
  );
}
