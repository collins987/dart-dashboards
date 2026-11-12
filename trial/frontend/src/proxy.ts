import { NextResponse, type NextRequest } from "next/server";

// Request proxy (Next.js 16). Auth is handled by the existing SSO system,
// so this passes every request through.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}
