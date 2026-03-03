import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip Next internals, API routes, and static images
  // Placeholder images don't have cookies (weird bug)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpe?g|webp|svg|gif)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.includes(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/courses", req.url));
  }

  return NextResponse.next();
}
