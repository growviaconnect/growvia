import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/profile", "/settings", "/calendar", "/onboarding"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/lander") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const auth = request.cookies.get("gv_auth")?.value;
    if (!auth) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lander",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/calendar/:path*",
    "/onboarding/:path*",
  ],
};
