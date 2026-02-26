CREATE TABLE users (
    id TEXT PRIMARY KEY,
    github_username TEXT NOT NULL,
    avatar_url TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    live_chat_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    created_at INTEGER NOT NULL
);

CREATE TABLE scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_by TEXT REFERENCES users(id),
    definition TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE room_sessions (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    message_count INTEGER DEFAULT 0,
    polling_count INTEGER DEFAULT 0
);
