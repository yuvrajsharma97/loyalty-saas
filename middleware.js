import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if user is accessing protected routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/user")
  ) {
    // In a real app, you'd check for valid JWT token
    const token = request.cookies.get("auth-token");



    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/store/:path*", "/user/:path*"],
};
