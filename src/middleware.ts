import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ensure the root path always serves the homepage and is never
  // redirected to /lander or any other route.
  const { pathname } = request.nextUrl;

  if (pathname === "/lander") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lander"],
};
