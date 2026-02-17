import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createItem, listItems, type ItemType } from "@/lib/items";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const url = req.nextUrl;
  const params = {
    type: url.searchParams.get("type") as ItemType | undefined,
    date_from: url.searchParams.get("date_from") ?? undefined,
    date_to: url.searchParams.get("date_to") ?? undefined,
    limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined,
    offset: url.searchParams.has("offset") ? Number(url.searchParams.get("offset")) : undefined,
  };

  const result = listItems(params);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json();

  if (!body.type || !body.title) {
    return NextResponse.json(
      { error: "type and title are required" },
      { status: 400 }
    );
  }

  const validTypes = ["note", "conversation", "task", "bookmark", "snippet"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const item = createItem({
    type: body.type,
    title: body.title,
    content: body.content,
    metadata: body.metadata,
    tags: body.tags,
  });

  return NextResponse.json(item, { status: 201 });
}
