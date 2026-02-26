export interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  ROOM_OBJECT: DurableObjectNamespace;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  SITE_URL: string;
}
