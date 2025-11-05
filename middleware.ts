import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If OAuth user doesn't have a role, redirect to role selection
    if (token && !token.role && !path.startsWith("/onboarding/select-role")) {
      return NextResponse.redirect(new URL("/onboarding/select-role", req.url));
    }

    // Redirect to onboarding if not completed (except buyers)
    if (
      token &&
      token.role &&
      token.onboardingStatus !== "COMPLETED" &&
      !path.startsWith("/onboarding") &&
      !path.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Role-based access control
    if (path.startsWith("/dashboard/supplier") && token?.role !== "SUPPLIER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/mechanic") && token?.role !== "MECHANIC") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      path.startsWith("/dashboard/logistics") &&
      token?.role !== "LOGISTICS"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public paths
        if (
          path === "/" ||
          path.startsWith("/login") ||
          path.startsWith("/signup") ||
          path.startsWith("/about") ||
          path.startsWith("/shop") ||
          path.startsWith("/business") ||
          path.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected paths require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*"],
};
