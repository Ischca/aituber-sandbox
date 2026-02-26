/**
 * セッション情報の型定義
 */
export interface Session {
  userId: number;
  createdAt: number;
}

/**
 * セッショントークンを生成
 * @returns ランダムなUUID形式のトークン
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

/**
 * セッションを作成してKVに保存
 * @param kv KVNamespace
 * @param token セッショントークン
 * @param userId ユーザーID
 * @param ttl セッションの有効期限（秒）デフォルト7日間
 */
export async function createSession(
  kv: KVNamespace,
  token: string,
  userId: number,
  ttl: number = 86400 * 7
): Promise<void> {
  const session: Session = {
    userId,
    createdAt: Date.now(),
  };

  const key = `session:${token}`;
  await kv.put(key, JSON.stringify(session), { expirationTtl: ttl });
}

/**
 * セッションを取得
 * @param kv KVNamespace
 * @param token セッショントークン
 * @returns セッション情報、存在しない場合はnull
 */
export async function getSession(kv: KVNamespace, token: string): Promise<Session | null> {
  const key = `session:${token}`;
  const value = await kv.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Session;
  } catch {
    return null;
  }
}

/**
 * セッションを削除
 * @param kv KVNamespace
 * @param token セッショントークン
 */
export async function deleteSession(kv: KVNamespace, token: string): Promise<void> {
  const key = `session:${token}`;
  await kv.delete(key);
}

/**
 * セッションCookieを設定
 * @param headers Headers オブジェクト
 * @param token セッショントークン
 */
export function setSessionCookie(headers: Headers, token: string): void {
  const maxAge = 604800; // 7日間（秒）
  const cookie = [
    `session=${token}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${maxAge}`,
  ].join("; ");

  headers.append("Set-Cookie", cookie);
}

/**
 * セッションCookieをクリア
 * @param headers Headers オブジェクト
 */
export function clearSessionCookie(headers: Headers): void {
  const cookie = [
    `session=`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=0`,
  ].join("; ");

  headers.append("Set-Cookie", cookie);
}
