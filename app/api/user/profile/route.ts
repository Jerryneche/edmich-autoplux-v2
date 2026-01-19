// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    // Get profile based on role
    let profile = null;

    if (user.role === "SUPPLIER") {
      profile = await prisma.supplierProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === "MECHANIC") {
      profile = await prisma.mechanicProfile.findUnique({
        where: { userId: user.id },
      });
    } else if (user.role === "LOGISTICS") {
      profile = await prisma.logisticsProfile.findUnique({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        isGoogleAuth: user.isGoogleAuth,
        hasPassword: user.hasPassword,
        onboardingStatus: user.onboardingStatus,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(req: NextRequest) {
  console.log("[USER PROFILE PATCH] Starting...");

  try {
    const { user, error } = await getAuthUserFromToken(req);

    if (!user) {
      console.log("[USER PROFILE PATCH] Auth failed:", error);
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    const body = await req.json();
    console.log("[USER PROFILE PATCH] Body:", JSON.stringify(body));

    const { name, phone } = body;

    // Build update data (only include fields that are provided)
    const updateData: { name?: string; phone?: string | null } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isGoogleAuth: true,
        hasPassword: true,
      },
    });

    console.log("[USER PROFILE PATCH] Success:", updatedUser.id);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[USER PROFILE PATCH] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
