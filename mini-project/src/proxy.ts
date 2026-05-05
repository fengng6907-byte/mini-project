import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PROTECTED = ["/dashboard", "/portfolio", "/leaderboard"];
const AUTH_ONLY = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("gold_token")?.value;
  const payload = token ? verifyToken(token) : null;
  const { pathname } = req.nextUrl;

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && payload) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portfolio/:path*", "/leaderboard/:path*", "/login", "/register"],
};
