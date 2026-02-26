# MediaMTX セットアップガイド

OBS → RTMP → MediaMTX → HLS → ブラウザ の構成で、ローカルでライブ配信をシミュレーションします。

## 1. MediaMTX のインストール

### macOS

```bash
brew install mediamtx
```

### Linux / Windows

[MediaMTX Releases](https://github.com/bluenviron/mediamtx/releases) からバイナリをダウンロード。

## 2. MediaMTX の起動

```bash
mediamtx
```

デフォルト設定で以下のポートが使用されます:

| プロトコル | ポート |
|-----------|--------|
| RTMP      | 1935   |
| HLS       | 8888   |
| WebRTC    | 8889   |

## 3. OBS の設定

1. OBS を起動
2. **設定** → **配信** を開く
3. 以下を入力:
   - **サービス**: カスタム
   - **サーバー**: `rtmp://localhost:1935/stream`
   - **ストリームキー**: `live`
4. **適用** → **配信開始** をクリック

## 4. HLS URL

配信開始後、以下の URL で HLS ストリームにアクセスできます:

```
http://localhost:8888/stream/live/index.m3u8
```

AITuber Sandbox のルーム設定で、この URL を `HLS URL` フィールドに入力してください（デフォルトでこの値が設定されています）。

## 5. 動作確認

1. `pnpm dev` でアプリを起動
2. ルーム作成 or 既存ルームを開く
3. 「視聴者ページを開く」をクリック
4. MediaMTX を起動し、OBS で配信を開始
5. 視聴者ページに映像が表示されることを確認

## 6. Cloudflare Stream（本番環境）

本番環境では Cloudflare Stream を使用することも可能です:

1. Cloudflare Dashboard → Stream → Live Inputs で入力を作成
2. RTMP URL とストリームキーを OBS に設定
3. HLS の再生 URL をルームの `streamUrl` に設定

```
https://customer-<id>.cloudflarestream.com/<video-id>/manifest/video.m3u8
```
