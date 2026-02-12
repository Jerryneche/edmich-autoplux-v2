// app/api/auth/me/route.ts
// GET CURRENT USER - Alias for /api/user/profile (for mobile compatibility)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
  try {
    let userEmail: string | null = null;

    // 1. Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase();
    }

    // 2. Try auth-token cookie
    if (!userEmail) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
          if (decoded.email) {
            userEmail = (decoded.email as string).toLowerCase();
          }
        } catch (e) {}
      }
    }

    // 3. Try Authorization header
    if (!userEmail) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(
            authHeader.substring(7),
            JWT_SECRET
          ) as Record<string, unknown>;
          if (decoded.email) {
            userEmail = (decoded.email as string).toLowerCase();
          }
        } catch (e) {}
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        image: true,
        role: true,
        emailVerified: true,
        onboardingStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        image: user.image,
        role: user.role,
        emailVerified: !!user.emailVerified,
        onboardingStatus: user.onboardingStatus,
      },
    });
  } catch (error: any) {
    console.error("[ME] Error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
