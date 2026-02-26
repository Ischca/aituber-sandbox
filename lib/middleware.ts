import { getSession } from "./session";

/**
 * リクエストからセッショントークンを取得し、セッション情報を返す
 * @param request Request オブジェクト
 * @param kv KVNamespace
 * @returns セッション情報、存在しない場合はnull
 */
export async function getSessionFromRequest(
  request: Request,
  kv: KVNamespace
): Promise<{ userId: number; createdAt: number } | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }

  // Cookie ヘッダーから session トークンを抽出
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies["session"];
  if (!token) {
    return null;
  }

  // KV からセッション情報を取得
  const session = await getSession(kv, token);
  return session;
}

/**
 * 認証チェックを行い、ユーザーIDを返す
 * @param request Request オブジェクト
 * @param kv KVNamespace
 * @returns ユーザーID、未認証の場合はnull
 */
export async function requireAuth(request: Request, kv: KVNamespace): Promise<number | null> {
  const session = await getSessionFromRequest(request, kv);
  if (!session) {
    return null;
  }

  return session.userId;
}
