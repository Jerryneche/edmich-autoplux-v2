// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper to extract user from token
async function getAuthUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return { user: null, error: "Server config error" };
    }

    const decoded = jwt.verify(token, secret) as {
      userId?: string;
      id?: string;
      sub?: string;
    };
    const userId = decoded.userId || decoded.id || decoded.sub;

    if (!userId) {
      return { user: null, error: "No user ID in token" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { user: null, error: "User not found" };
    }

    return { user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// POST - Change password for users with existing password
export async function POST(req: NextRequest) {
  console.log("[CHANGE PASSWORD] Starting...");

  try {
    const { user, error } = await getAuthUserFromToken(req);

    if (!user) {
      console.log("[CHANGE PASSWORD] Auth failed:", error);
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    // Check if user has a password to change
    if (!user.password) {
      return NextResponse.json(
        { error: "No password set. Use set-password endpoint instead." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        hasPassword: true,
      },
    });

    console.log("[CHANGE PASSWORD] Success for user:", user.id);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CHANGE PASSWORD] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
