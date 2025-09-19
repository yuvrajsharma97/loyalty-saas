// middleware/middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // You can add additional middleware logic here if needed
    // For example, logging, rate limiting, etc.
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages and public API routes
        if (pathname.startsWith("/auth") || pathname === "/api/auth") {
          return true;
        }

        // API route protection
        if (pathname.startsWith("/api/")) {
          // Admin API routes
          if (pathname.startsWith("/api/admin")) {
            return token?.role === "SuperAdmin";
          }

          // Store admin API routes
          if (pathname.startsWith("/api/store")) {
            return token?.role === "StoreAdmin" || token?.role === "SuperAdmin";
          }

          // User API routes
          if (pathname.startsWith("/api/user")) {
            return (
              token?.role === "User" ||
              token?.role === "StoreAdmin" ||
              token?.role === "SuperAdmin"
            );
          }

          // Public API routes (if any)
          if (pathname.startsWith("/api/public")) {
            return true;
          }

          // All other API routes require authentication
          return !!token;
        }

        // Page route protection
        if (pathname.startsWith("/admin")) {
          return token?.role === "SuperAdmin";
        }

        if (pathname.startsWith("/store")) {
          return token?.role === "StoreAdmin" || token?.role === "SuperAdmin";
        }

        if (pathname.startsWith("/user")) {
          return (
            token?.role === "User" ||
            token?.role === "StoreAdmin" ||
            token?.role === "SuperAdmin"
          );
        }

        // Default: require authentication for all other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect all admin routes (pages and API)
    "/admin/:path*",
    "/api/admin/:path*",

    // Protect all store routes (pages and API)
    "/store/:path*",
    "/api/store/:path*",

    // Protect all user routes (pages and API)
    "/user/:path*",
    "/api/user/:path*",
    
    // You can add other protected routes here
    // "/dashboard/:path*",
  ],
};
