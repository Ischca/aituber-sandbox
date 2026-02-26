import { NextRequest, NextResponse } from "next/server";
import { createGitHubClient, createAuthorizationURL } from "@/lib/auth";

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
 * OAuth 開始エンドポイント
 * GitHub の認可画面にリダイレクトする
 */
export async function GET(
  request: NextRequest,
  context?: { env?: CloudflareEnv }
): Promise<NextResponse> {
  try {
    // 環境変数の取得（process.env をフォールバックとして使用）
    const clientId =
      context?.env?.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret =
      context?.env?.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "GitHub OAuth credentials not configured" },
        { status: 500 }
      );
    }

    // GitHub OAuth クライアントを作成
    const github = createGitHubClient(clientId, clientSecret);

    // CSRF対策用の state を生成
    const state = crypto.randomUUID();

    // Authorization URL を生成
    const authUrl = createAuthorizationURL(github, state);

    // state を Cookie に保存（CSRF対策）
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10分間有効
    });

    return response;
  } catch (error) {
    console.error("GitHub OAuth start error:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}
