import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { db } from "@/../db";
import { items } from "@/../db/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || "./data";

function countMarkdownFiles(dir: string): number {
  let count = 0;
  if (!fs.existsSync(dir)) return count;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countMarkdownFiles(fullPath);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      count++;
    }
  }
  return count;
}

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const totalItems = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .get();

  const fromFiles = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .where(sql`source_path IS NOT NULL`)
    .get();

  const absDir = path.resolve(DATA_DIR);
  const filesOnDisk = countMarkdownFiles(absDir);

  return NextResponse.json({
    total_items: totalItems?.count ?? 0,
    ingested_from_files: fromFiles?.count ?? 0,
    files_on_disk: filesOnDisk,
    data_dir: absDir,
  });
}
