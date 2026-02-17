import matter from "gray-matter";
import path from "path";
import type { ItemType } from "./items";

export interface ParsedMarkdown {
  title: string;
  type: ItemType;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

const VALID_TYPES = new Set(["note", "conversation", "task", "bookmark", "snippet"]);

export function parseMarkdownFile(filePath: string, raw: string): ParsedMarkdown {
  const { data: frontmatter, content } = matter(raw);

  const title =
    frontmatter.title ||
    path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, " ");

  const type: ItemType = VALID_TYPES.has(frontmatter.type)
    ? (frontmatter.type as ItemType)
    : "note";

  const tags: string[] = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map(String)
    : typeof frontmatter.tags === "string"
      ? frontmatter.tags.split(",").map((t: string) => t.trim())
      : [];

  // Everything in frontmatter except the fields we extract
  const { title: _t, type: _ty, tags: _ta, ...rest } = frontmatter;
  void _t; void _ty; void _ta;

  return {
    title,
    type,
    content: content.trim(),
    tags,
    metadata: rest,
  };
}
