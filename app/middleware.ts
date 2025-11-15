import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to these routes
    if (
      path.startsWith("/api/auth") ||
      path === "/login" ||
      path === "/signup" ||
      path === "/"
    ) {
      return NextResponse.next();
    }

    // Check for mechanic role and profile
    if (path.startsWith("/dashboard/mechanic")) {
      if (token?.role !== "MECHANIC") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If mechanic but no profile, redirect to onboarding
      if (!token.hasMechanicProfile) {
        return NextResponse.redirect(new URL("/onboarding/mechanic", req.url));
      }
    }

    // Check for supplier role and profile
    if (path.startsWith("/dashboard/supplier")) {
      if (token?.role !== "SUPPLIER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If supplier but no profile, redirect to onboarding
      if (!token.hasSupplierProfile) {
        return NextResponse.redirect(new URL("/onboarding/supplier", req.url));
      }
    }

    // Check for logistics role and profile
    if (path.startsWith("/dashboard/logistics")) {
      if (token?.role !== "LOGISTICS") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If logistics but no profile, redirect to onboarding
      if (!token.hasLogisticsProfile) {
        return NextResponse.redirect(new URL("/onboarding/logistics", req.url));
      }
    }

    // Prevent access to onboarding if already completed
    if (path.startsWith("/onboarding/mechanic")) {
      if (token?.role !== "MECHANIC") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If already has profile, redirect to dashboard
      if (token.hasMechanicProfile) {
        return NextResponse.redirect(new URL("/dashboard/mechanic", req.url));
      }
    }

    if (path.startsWith("/onboarding/supplier")) {
      if (token?.role !== "SUPPLIER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If already has profile, redirect to dashboard
      if (token.hasSupplierProfile) {
        return NextResponse.redirect(new URL("/dashboard/supplier", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/orders/:path*",
    "/bookings/:path*",
  ],
};
