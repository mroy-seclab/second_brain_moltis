import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { scanDataDirectory } from "@/lib/ingest";

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const result = scanDataDirectory();
  return NextResponse.json(result);
}
