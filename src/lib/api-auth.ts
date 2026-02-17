import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;

export function requireAuth(req: NextRequest): NextResponse | null {
  // If no API_KEY is configured, skip auth (dev mode)
  if (!API_KEY) return null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  if (token !== API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  return null;
}
