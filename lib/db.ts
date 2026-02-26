import type { Room, RoomSession } from '../types/room';

// D1 の snake_case カラムを camelCase にマッピング
function mapRoom(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    name: row.name as string,
    liveChatId: row.live_chat_id as string,
    status: row.status as Room["status"],
    createdAt: row.created_at as number,
  };
}

function mapRoomSession(row: Record<string, unknown>): RoomSession {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    startedAt: row.started_at as number,
    endedAt: row.ended_at as number | undefined,
    messageCount: row.message_count as number,
    pollingCount: row.polling_count as number,
  };
}

// ユーザー操作

export async function getUserById(db: D1Database, id: string) {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return result;
}

export async function getUserByGithubUsername(db: D1Database, username: string) {
  const result = await db.prepare('SELECT * FROM users WHERE github_username = ?').bind(username).first();
  return result;
}

export async function createUser(
  db: D1Database,
  params: { id: string; githubUsername: string; avatarUrl?: string }
) {
  const createdAt = Date.now();
  await db
    .prepare('INSERT INTO users (id, github_username, avatar_url, created_at) VALUES (?, ?, ?, ?)')
    .bind(params.id, params.githubUsername, params.avatarUrl || null, createdAt)
    .run();
  return getUserById(db, params.id);
}

// ルーム操作

export async function getRoomsByOwnerId(db: D1Database, ownerId: string): Promise<Room[]> {
  const result = await db
    .prepare('SELECT * FROM rooms WHERE owner_id = ? ORDER BY created_at DESC')
    .bind(ownerId)
    .all();
  return (result.results || []).map((row) => mapRoom(row as Record<string, unknown>));
}

export async function getRoomById(db: D1Database, id: string): Promise<Room | null> {
  const result = await db.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first();
  return result ? mapRoom(result as Record<string, unknown>) : null;
}

export async function getRoomByLiveChatId(db: D1Database, liveChatId: string): Promise<Room | null> {
  const result = await db.prepare('SELECT * FROM rooms WHERE live_chat_id = ?').bind(liveChatId).first();
  return result ? mapRoom(result as Record<string, unknown>) : null;
}

export async function createRoom(
  db: D1Database,
  params: { id: string; ownerId: string; name: string; liveChatId: string }
) {
  const createdAt = Date.now();
  await db
    .prepare('INSERT INTO rooms (id, owner_id, name, live_chat_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(params.id, params.ownerId, params.name, params.liveChatId, 'idle', createdAt)
    .run();
  return getRoomById(db, params.id);
}

export async function updateRoomStatus(db: D1Database, id: string, status: string) {
  await db.prepare('UPDATE rooms SET status = ? WHERE id = ?').bind(status, id).run();
  return getRoomById(db, id);
}

export async function deleteRoom(db: D1Database, id: string) {
  await db.prepare('DELETE FROM rooms WHERE id = ?').bind(id).run();
}

// ルームセッション操作

export async function createRoomSession(db: D1Database, params: { id: string; roomId: string }) {
  const startedAt = Date.now();
  await db
    .prepare('INSERT INTO room_sessions (id, room_id, started_at, message_count, polling_count) VALUES (?, ?, ?, ?, ?)')
    .bind(params.id, params.roomId, startedAt, 0, 0)
    .run();
  return getRoomSessionById(db, params.id);
}

export async function getRoomSessionById(db: D1Database, id: string): Promise<RoomSession | null> {
  const result = await db.prepare('SELECT * FROM room_sessions WHERE id = ?').bind(id).first();
  return result ? mapRoomSession(result as Record<string, unknown>) : null;
}

export async function endRoomSession(db: D1Database, id: string) {
  const endedAt = Date.now();
  await db.prepare('UPDATE room_sessions SET ended_at = ? WHERE id = ?').bind(endedAt, id).run();
  return getRoomSessionById(db, id);
}

export async function incrementSessionMessageCount(db: D1Database, sessionId: string) {
  await db.prepare('UPDATE room_sessions SET message_count = message_count + 1 WHERE id = ?').bind(sessionId).run();
}

export async function incrementSessionPollingCount(db: D1Database, sessionId: string) {
  await db.prepare('UPDATE room_sessions SET polling_count = polling_count + 1 WHERE id = ?').bind(sessionId).run();
}
