import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages
        if (pathname.startsWith("/auth")) {
          return true;
        }

        // Check role-based access
        if (pathname.startsWith("/admin")) {
          return token?.role === "SuperAdmin";
        }

        if (pathname.startsWith("/store")) {
          return token?.role === "StoreAdmin";
        }

        if (pathname.startsWith("/user")) {
          return token?.role === "User";
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/store/:path*", "/user/:path*"],
};
