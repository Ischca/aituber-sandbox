import { NextRequest, NextResponse } from "next/server";
import {
  createGitHubClient,
  validateAuthorizationCode,
  getGitHubUser,
} from "@/lib/auth";
import {
  generateSessionToken,
  createSession,
  setSessionCookie,
} from "@/lib/session";

/**
 * Cloudflare Workers 環境の型定義
 */
interface CloudflareEnv {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

/**
 * OAuth コールバックエンドポイント
 * GitHub からの認可コードを受け取り、セッションを作成する
 */
export async function GET(
  request: NextRequest,
  context?: { env?: CloudflareEnv }
): Promise<NextResponse> {
  try {
    // URL パラメータから code と state を取得
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/login?error=missing_params", request.url)
      );
    }

    // Cookie から保存した state を取得して検証（CSRF対策）
    const savedState = request.cookies.get("github_oauth_state")?.value;
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_state", request.url)
      );
    }

    // 環境変数の取得
    const clientId =
      context?.env?.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret =
      context?.env?.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/login?error=config_error", request.url)
      );
    }

    // Cloudflare バインディングの取得
    const db = context?.env?.DB;
    const sessionKV = context?.env?.SESSION_KV;

    if (!db || !sessionKV) {
      console.error("Missing Cloudflare bindings (DB or SESSION_KV)");
      return NextResponse.redirect(
        new URL("/login?error=binding_error", request.url)
      );
    }

    // GitHub OAuth クライアントを作成
    const github = createGitHubClient(clientId, clientSecret);

    // 認可コードをアクセストークンに交換
    const tokens = await validateAuthorizationCode(github, code);

    // GitHub API でユーザー情報を取得
    const githubUser = await getGitHubUser(tokens.accessToken());

    // D1 でユーザーを作成 or 取得（upsert）
    // users テーブルの id は TEXT 型で GitHub user ID を文字列として保存
    const userId = String(githubUser.id);
    const now = Date.now();

    // ユーザーが存在するか確認
    const existingUser = await db
      .prepare("SELECT id FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!existingUser) {
      // 新規ユーザーを作成
      await db
        .prepare(
          "INSERT INTO users (id, github_username, avatar_url, created_at) VALUES (?, ?, ?, ?)"
        )
        .bind(userId, githubUser.login, githubUser.avatar_url, now)
        .run();
    } else {
      // 既存ユーザーの情報を更新
      await db
        .prepare(
          "UPDATE users SET github_username = ?, avatar_url = ? WHERE id = ?"
        )
        .bind(githubUser.login, githubUser.avatar_url, userId)
        .run();
    }

    // セッションを作成（KV）
    const sessionToken = generateSessionToken();
    // userId は number 型だが、D1 では TEXT として保存されているため number として扱う
    await createSession(sessionKV, sessionToken, githubUser.id);

    // セッション Cookie を設定してダッシュボードにリダイレクト
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    setSessionCookie(response.headers, sessionToken);

    // OAuth state Cookie をクリア
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=callback_failed", request.url)
    );
  }
}
