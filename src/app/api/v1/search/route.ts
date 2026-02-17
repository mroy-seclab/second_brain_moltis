import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { searchItems, type ItemType } from "@/lib/items";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const url = req.nextUrl;
  const q = url.searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: "q parameter is required" }, { status: 400 });
  }

  const results = searchItems({
    q: q.trim(),
    type: (url.searchParams.get("type") as ItemType) ?? undefined,
    date_from: url.searchParams.get("date_from") ?? undefined,
    date_to: url.searchParams.get("date_to") ?? undefined,
    limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined,
  });

  return NextResponse.json({ items: results, total: results.length });
}
