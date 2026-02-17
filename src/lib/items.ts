import { db, sqlite } from "@/../db";
import { items, type Item } from "@/../db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { generateId, nowISO } from "./utils";

export type ItemType = "note" | "conversation" | "task" | "bookmark" | "snippet";

export interface CreateItemInput {
  type: ItemType;
  title: string;
  content?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  source_path?: string;
  content_hash?: string;
}

export interface UpdateItemInput {
  type?: ItemType;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface ListItemsParams {
  type?: ItemType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  q: string;
  type?: ItemType;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export function createItem(input: CreateItemInput): Item {
  const now = nowISO();
  const id = generateId();
  const row = {
    id,
    type: input.type,
    title: input.title,
    content: input.content ?? "",
    metadata: input.metadata ?? {},
    tags: input.tags ?? [],
    source_path: input.source_path ?? null,
    content_hash: input.content_hash ?? null,
    created_at: now,
    updated_at: now,
  };
  db.insert(items).values(row).run();
  return row;
}

export function getItem(id: string): Item | undefined {
  return db.select().from(items).where(eq(items.id, id)).get();
}

export function listItems(params: ListItemsParams = {}): { items: Item[]; total: number } {
  const conditions = [];
  if (params.type) conditions.push(eq(items.type, params.type));
  if (params.date_from) conditions.push(gte(items.created_at, params.date_from));
  if (params.date_to) conditions.push(lte(items.created_at, params.date_to));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const rows = db
    .select()
    .from(items)
    .where(where)
    .orderBy(desc(items.updated_at))
    .limit(limit)
    .offset(offset)
    .all();

  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .where(where)
    .get();

  return { items: rows, total: countResult?.count ?? 0 };
}

export function updateItem(id: string, input: UpdateItemInput): Item | undefined {
  const existing = getItem(id);
  if (!existing) return undefined;

  const now = nowISO();
  db.update(items)
    .set({
      ...(input.type !== undefined && { type: input.type }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.metadata !== undefined && { metadata: input.metadata }),
      ...(input.tags !== undefined && { tags: input.tags }),
      updated_at: now,
    })
    .where(eq(items.id, id))
    .run();

  return getItem(id);
}

export function deleteItem(id: string): boolean {
  const result = db.delete(items).where(eq(items.id, id)).run();
  return result.changes > 0;
}

export function searchItems(params: SearchParams): Item[] {
  const limit = params.limit ?? 20;

  // Build FTS5 query — escape double quotes in user input
  const escaped = params.q.replace(/"/g, '""');
  const ftsQuery = `"${escaped}"`;

  let sqlStr = `
    SELECT items.*
    FROM items_fts
    JOIN items ON items.rowid = items_fts.rowid
    WHERE items_fts MATCH ?
  `;
  const bindings: (string | number)[] = [ftsQuery];

  if (params.type) {
    sqlStr += ` AND items.type = ?`;
    bindings.push(params.type);
  }
  if (params.date_from) {
    sqlStr += ` AND items.created_at >= ?`;
    bindings.push(params.date_from);
  }
  if (params.date_to) {
    sqlStr += ` AND items.created_at <= ?`;
    bindings.push(params.date_to);
  }

  sqlStr += ` ORDER BY rank LIMIT ?`;
  bindings.push(limit);

  const stmt = sqlite.prepare(sqlStr);
  const rows = stmt.all(...bindings) as Record<string, unknown>[];
  return rows.map((row) => ({
    ...row,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
  })) as Item[];
}

export function upsertBySourcePath(
  source_path: string,
  content_hash: string,
  input: Omit<CreateItemInput, "source_path" | "content_hash">
): { item: Item; action: "created" | "updated" | "unchanged" } {
  const existing = db
    .select()
    .from(items)
    .where(eq(items.source_path, source_path))
    .get();

  if (!existing) {
    const item = createItem({ ...input, source_path, content_hash });
    return { item, action: "created" };
  }

  if (existing.content_hash === content_hash) {
    return { item: existing, action: "unchanged" };
  }

  const now = nowISO();
  db.update(items)
    .set({
      type: input.type,
      title: input.title,
      content: input.content ?? "",
      metadata: input.metadata ?? {},
      tags: input.tags ?? [],
      content_hash,
      updated_at: now,
    })
    .where(eq(items.id, existing.id))
    .run();

  return { item: getItem(existing.id)!, action: "updated" };
}
