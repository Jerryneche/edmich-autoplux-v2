// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. OAuth users without role → force role selection
    if (
      token &&
      !token.role &&
      !path.startsWith("/onboarding/select-role") &&
      !path.startsWith("/select-role")
    ) {
      return NextResponse.redirect(new URL("/select-role", req.url));
    }

    // 2. Non-BUYERS: Must complete onboarding
    if (
      token &&
      token.role &&
      token.role !== "BUYER" &&
      token.onboardingStatus !== "COMPLETED" &&
      !path.startsWith("/onboarding") &&
      !path.startsWith("/api")
    ) {
      const rolePath = (token.role as string).toLowerCase();
      return NextResponse.redirect(new URL(`/onboarding/${rolePath}`, req.url));
    }

    // 3. BUYERS: Auto-complete onboarding on first visit
    if (
      token &&
      token.role === "BUYER" &&
      token.onboardingStatus !== "COMPLETED" &&
      !path.startsWith("/api")
    ) {
      // Update in background
      Promise.resolve().then(async () => {
        try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/api/user/complete-onboarding`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: token.sub }),
            }
          );
        } catch (err) {
          console.error("Failed to auto-complete buyer onboarding:", err);
        }
      });
      // Allow access
      return NextResponse.next();
    }

    // 4. Role-based dashboard access
    const roleRoutes: Record<string, string> = {
      SUPPLIER: "/dashboard/supplier",
      MECHANIC: "/dashboard/mechanic",
      LOGISTICS: "/dashboard/logistics",
      ADMIN: "/dashboard/admin",
      BUYER: "/dashboard/buyer",
    };

    const protectedRoute = Object.entries(roleRoutes).find(([_, route]) =>
      path.startsWith(route)
    );

    if (protectedRoute && token?.role !== protectedRoute[0]) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes - ADD verify-email and select-role here
        const publicPaths = [
          "/",
          "/login",
          "/signup",
          "/verify-email",
          "/select-role",
          "/forgot-password",
          "/about",
          "/shop",
          "/business",
          "/api/auth",
          "/api/auth/register",
          "/api/auth/verify-email",
          "/api/auth/resend-code",
          "/api/auth/update-role",
          "/api/auth/login",
          "/onboarding/select-role",
        ];

        if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
          return true;
        }

        // All other routes require auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/api/user/:path*",
    "/profile",
    "/products",
    "/logistics",
  ],
};
