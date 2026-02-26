import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* ヒーローセクション */}
      <section className="mb-24 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          AITuber Sandbox
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          YouTube Live を開かずにAITuberをテスト
        </p>
        <Button size="lg" asChild>
          <a href="/rooms">
            はじめる
          </a>
        </Button>
      </section>

      {/* 機能紹介カード */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>YouTube API 互換</CardTitle>
            <CardDescription>
              本番同様のポーリングでテスト
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              YouTube Live Chat API v3 と同じレスポンス形式を返すため、
              実際の配信と同じコードでテストできます。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>シナリオ再生</CardTitle>
            <CardDescription>
              荒らし・スパチャ連打などの自動テスト
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              事前に定義したシナリオを自動再生。
              エッジケースやストレステストを簡単に実施できます。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リアルタイムメトリクス</CardTitle>
            <CardDescription>
              パフォーマンスの定量評価
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              応答レイテンシ、フィラー率、発話中断率などを
              リアルタイムで可視化・記録します。
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
