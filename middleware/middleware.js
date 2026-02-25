
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;


        if (pathname.startsWith("/auth") || pathname === "/api/auth") {
          return true;
        }


        if (pathname.startsWith("/api/")) {

          if (pathname.startsWith("/api/admin")) {
            return token?.role === "SuperAdmin";
          }


          if (pathname.startsWith("/api/store")) {
            return token?.role === "StoreAdmin" || token?.role === "SuperAdmin";
          }


          if (pathname.startsWith("/api/user")) {
            return (
              token?.role === "User" ||
              token?.role === "StoreAdmin" ||
              token?.role === "SuperAdmin");

          }


          if (pathname.startsWith("/api/public")) {
            return true;
          }


          return !!token;
        }


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
            token?.role === "SuperAdmin");

        }

        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [

  "/admin/:path*",
  "/api/admin/:path*",


  "/store/:path*",
  "/api/store/:path*",


  "/user/:path*",
  "/api/user/:path*"]

};