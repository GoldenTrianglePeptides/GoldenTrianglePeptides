import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request" }, { status: 403 });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
