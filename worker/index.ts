// ============================================================
// Cloudflare Workers デプロイ専用
// ローカル開発では使用されない（devStore がフォールバックとして動作する）
// ============================================================

// Durable Objects の re-export（wrangler がクラスを発見するために必要）
export { RoomObject } from "./room-object";

// Cloudflare Vite plugin が Worker エントリとして有効な fetch ハンドラを要求する。
// ViNext がリクエストルーティングを処理するため、ここでは最小限のハンドラを定義。
export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: ExecutionContext
  ): Promise<Response> {
    // ViNext がこのハンドラをオーバーライドしてルーティングを処理する
    return new Response("Not Found", { status: 404 });
  },
};
