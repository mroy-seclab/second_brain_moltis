import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getItem, updateItem, deleteItem } from "@/lib/items";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { id } = await params;
  const item = getItem(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const updated = updateItem(id, {
    type: body.type,
    title: body.title,
    content: body.content,
    metadata: body.metadata,
    tags: body.tags,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const updated = updateItem(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { id } = await params;
  const deleted = deleteItem(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
