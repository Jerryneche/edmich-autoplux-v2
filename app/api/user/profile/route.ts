// app/api/user/profile/route.ts
// GET USER PROFILE - Works with both NextAuth session and JWT token

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

    // 1. Try NextAuth session first
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
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.email) {
            userEmail = decoded.email.toLowerCase();
          }
        } catch (e) {
          // Token expired or invalid
        }
      }
    }

    // 3. Try Authorization header (for mobile)
    if (!userEmail) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.email) {
            userEmail = decoded.email.toLowerCase();
          }
        } catch (e) {
          // Token expired or invalid
        }
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    // Fetch user
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
        createdAt: true,
        password: true, // Only to check if exists
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      image: user.image,
      role: user.role,
      emailVerified: !!user.emailVerified,
      hasPassword: !!user.password,
      onboardingStatus: user.onboardingStatus,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error("[PROFILE] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
