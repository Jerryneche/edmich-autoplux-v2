// app/api/mobile/user/set-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Set password for Google OAuth users (who don't have a password yet)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user data to check password status
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true, hasPassword: true },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a password
    if (fullUser.hasPassword && fullUser.password) {
      return NextResponse.json(
        {
          error: "Password already set. Use change-password endpoint instead.",
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
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
  } catch (error: unknown) {
    console.error("[MOBILE SET PASSWORD] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
