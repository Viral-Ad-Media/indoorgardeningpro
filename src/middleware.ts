import { NextResponse, type NextRequest } from "next/server";

/**
 * Pages use trailing slashes (to match the old WordPress URLs), but API routes
 * must not be redirected, or Better Auth's POST requests break.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") || pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = `${pathname}/`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/|uploads/).*)"],
};
