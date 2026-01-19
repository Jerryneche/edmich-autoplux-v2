// app/api/user/set-password/route.ts
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

// POST - Set password for Google OAuth users
export async function POST(req: NextRequest) {
  console.log("[SET PASSWORD] Starting...");

  try {
    const { user, error } = await getAuthUserFromToken(req);

    if (!user) {
      console.log("[SET PASSWORD] Auth failed:", error);
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    // Check if user already has a password
    if (user.hasPassword && user.password) {
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

    console.log("[SET PASSWORD] Success for user:", user.id);

    return NextResponse.json({
      success: true,
      message:
        "Password set successfully. You can now login with email and password.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SET PASSWORD] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
