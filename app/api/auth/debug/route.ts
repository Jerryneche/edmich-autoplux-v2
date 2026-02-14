// app/api/auth/debug/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("[DEBUG-AUTH] ===== COMPREHENSIVE AUTH DEBUG =====");
    const startTime = Date.now();

    // 1. Check environment
    console.log("[DEBUG-AUTH] 1. Environment Variables:");
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      DIRECT_URL: process.env.DIRECT_URL ? "SET" : "NOT SET",
    };
    console.log("[DEBUG-AUTH]", envCheck);

    // 2. Test database connection
    console.log("[DEBUG-AUTH] 2. Testing database connection...");
    const dbTest = await prisma.user.count();
    const dbTime = Date.now() - startTime;
    console.log("[DEBUG-AUTH] Database connection OK - user count:", dbTest, `(${dbTime}ms)`);

    // 3. Get current session
    console.log("[DEBUG-AUTH] 3. Fetching current session...");
    const sessionStart = Date.now();
    const session = await getServerSession(authOptions);
    const sessionTime = Date.now() - sessionStart;
    console.log("[DEBUG-AUTH] Session fetched in", sessionTime, "ms");
    console.log("[DEBUG-AUTH] Has session:", !!session);
    if (session?.user) {
      console.log("[DEBUG-AUTH] User ID:", session.user.id);
      console.log("[DEBUG-AUTH] User role:", session.user.role);
    }

    // 4. Try to find a test user
    console.log("[DEBUG-AUTH] 4. Checking for test users...");
    const testUsers = await prisma.user.findMany({
      where: { isGoogleAuth: true },
      select: { id: true, email: true, isGoogleAuth: true, emailVerified: true },
      take: 3,
    });
    console.log("[DEBUG-AUTH] Google auth users found:", testUsers.length);
    testUsers.forEach((u) => {
      console.log("[DEBUG-AUTH]", { email: u.email, verified: !!u.emailVerified });
    });

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      timings: {
        total: `${totalTime}ms`,
        database: `${dbTime}ms`,
        session: `${sessionTime}ms`,
      },
      session: {
        hasSession: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email || session.user.role,
          role: session.user.role,
          onboardingStatus: session.user.onboardingStatus,
        } : null,
      },
      env: envCheck,
      diagnostics: {
        googleAuthUsersCount: testUsers.length,
        totalUsersCount: dbTest,
      },
    });
  } catch (error) {
    console.error("[DEBUG-AUTH] ❌ Debug error:", error);
    const errorTime = Date.now();
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

