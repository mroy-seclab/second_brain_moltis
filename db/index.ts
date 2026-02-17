import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "./data/brain.db";

const sqlite = new Database(DATABASE_URL);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create items table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('note','conversation','task','bookmark','snippet')),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    metadata TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    source_path TEXT,
    content_hash TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// FTS5 virtual table for full-text search
sqlite.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
    title,
    content,
    tags,
    content='items',
    content_rowid='rowid'
  )
`);

// Triggers to keep FTS in sync
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
    INSERT INTO items_fts(rowid, title, content, tags)
    VALUES (new.rowid, new.title, new.content, new.tags);
  END
`);

sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
    INSERT INTO items_fts(items_fts, rowid, title, content, tags)
    VALUES ('delete', old.rowid, old.title, old.content, old.tags);
  END
`);

sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
    INSERT INTO items_fts(items_fts, rowid, title, content, tags)
    VALUES ('delete', old.rowid, old.title, old.content, old.tags);
    INSERT INTO items_fts(rowid, title, content, tags)
    VALUES (new.rowid, new.title, new.content, new.tags);
  END
`);

export const db = drizzle(sqlite, { schema });
export { sqlite };
