# AITuber Sandbox

YouTube Live Chat のシミュレータ。AITuber 開発時に本物の YouTube API を使わずにチャット機能をテストできる。

## クイックスタート

```bash
pnpm install
pnpm dev
```

http://localhost:3000 でアクセス。

## 使い方

1. **ルーム作成**: `/rooms` からルームを作成
2. **セッション開始**: ルーム詳細画面で「セッション開始」をクリック
3. **コメント送信**: チャット欄からコメントを投稿（スパチャも可能）
4. **AITuber 接続**: AITuber 側の `stream.toml` に接続先を設定

### AITuber 側の設定

```toml
# configs/stream.toml
[youtube]
base_url = "http://localhost:3000"
live_chat_id = "<ルーム詳細画面に表示される Live Chat ID>"
```

AITuber はこの設定で `/youtube/v3/liveChat/messages` をポーリングし、Sandbox に投稿されたコメントを取得する。

## シナリオ

`/scenarios` から定義済みのテストシナリオを確認できる。ルーム詳細画面のサイドバーからシナリオを選択・再生すると、自動的にコメントが投稿される。

| シナリオ | 内容 |
|---|---|
| excitement | 盛り上がり（大量の短いコメント） |
| superchat-rush | スパチャ連続 |
| spam | スパム耐性テスト |
| quiet | 静寂期間（間隔の長いコメント） |
| prompt-injection | プロンプトインジェクション耐性テスト |

## アーキテクチャ

- **ローカル開発**: インメモリストア (`lib/dev-store.ts`) で動作。外部サービス不要
- **Cloudflare デプロイ**: Durable Objects + D1 + KV で永続化・リアルタイム通信

どちらの環境でも同じソースコードが動作する。

## Cloudflare デプロイ（オプション）

```bash
# D1 データベースのマイグレーション
pnpm db:migrate

# デプロイ
pnpm deploy
```

`wrangler.jsonc` に Cloudflare の設定（D1, KV, Durable Objects バインディング）を記述する。

## 技術スタック

- [ViNext](https://github.com/cloudflare/vinext) (Vite + Next.js)
- React 19 / Zustand
- Tailwind CSS 4
- Cloudflare Workers / Durable Objects（オプション）
