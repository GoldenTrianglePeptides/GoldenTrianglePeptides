import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Reflects the current session (including isAdmin) — must never be cached by
// the framework or any proxy/CDN, or one user could be served another's identity.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
