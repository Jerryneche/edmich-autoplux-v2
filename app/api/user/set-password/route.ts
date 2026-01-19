// app/api/user/set-password/route.ts
// ===========================================
// Set Password for Google Users
// Allows Google OAuth users to set a password
// ===========================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // Try session auth first (web), then JWT (mobile)
    let userId: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Try JWT token for mobile
      const token = request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded?.userId) {
          userId = decoded.userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();

    // Validate password
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Get user to check if they're a Google user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isGoogleAuth: true,
        hasPassword: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a password
    if (user.hasPassword || user.password) {
      return NextResponse.json(
        { error: "Password already set. Use change-password endpoint." },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with new password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        hasPassword: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password set successfully. You can now login with email and password.",
    });
  } catch (error: any) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set password" },
      { status: 500 },
    );
  }
}
