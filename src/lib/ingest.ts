import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseMarkdownFile } from "./markdown";
import { upsertBySourcePath } from "./items";

const DATA_DIR = process.env.DATA_DIR || "./data";

export interface ScanResult {
  scanned: number;
  created: number;
  updated: number;
  unchanged: number;
  errors: string[];
}

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function scanDataDirectory(): ScanResult {
  const absDir = path.resolve(DATA_DIR);
  const files = findMarkdownFiles(absDir);

  const result: ScanResult = {
    scanned: files.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: [],
  };

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const hash = crypto.createHash("sha256").update(raw).digest("hex");
      const relativePath = path.relative(absDir, filePath);
      const parsed = parseMarkdownFile(relativePath, raw);

      const { action } = upsertBySourcePath(relativePath, hash, {
        type: parsed.type,
        title: parsed.title,
        content: parsed.content,
        metadata: parsed.metadata,
        tags: parsed.tags,
      });

      result[action]++;
    } catch (err) {
      result.errors.push(`${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
