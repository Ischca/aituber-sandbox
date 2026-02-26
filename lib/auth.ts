import { GitHub } from "arctic";

/**
 * GitHub OAuth クライアント作成関数
 * @param clientId GitHub OAuth App の Client ID
 * @param clientSecret GitHub OAuth App の Client Secret
 * @returns GitHub OAuth クライアント
 */
export function createGitHubClient(clientId: string, clientSecret: string): GitHub {
  return new GitHub(clientId, clientSecret, null);
}

/**
 * Authorization URL を生成
 * @param github GitHub OAuth クライアント
 * @param state CSRF対策用のstateパラメータ
 * @returns Authorization URL
 */
export function createAuthorizationURL(github: GitHub, state: string): URL {
  const scopes = ["read:user"];
  return github.createAuthorizationURL(state, scopes);
}

/**
 * 認可コードをアクセストークンに交換
 * @param github GitHub OAuth クライアント
 * @param code GitHub から返された認可コード
 * @returns トークン情報
 */
export async function validateAuthorizationCode(github: GitHub, code: string) {
  return github.validateAuthorizationCode(code);
}

/**
 * GitHub ユーザー情報を取得
 * @param accessToken GitHub アクセストークン
 * @returns ユーザー情報（id, login, avatar_url）
 */
export async function getGitHubUser(accessToken: string): Promise<{ id: number; login: string; avatar_url: string }> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "aituber-sandbox",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}
