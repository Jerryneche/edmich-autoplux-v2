// app/api/user/update-role/route.ts
// ===========================================
// Update User Role
// Supports both session (web) and JWT (mobile) auth
// ===========================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"];

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

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const normalizedRole = role.toUpperCase();

    if (!VALID_ROLES.includes(normalizedRole)) {
      return NextResponse.json(
        {
          error:
            "Invalid role. Must be BUYER, SUPPLIER, MECHANIC, or LOGISTICS",
        },
        { status: 400 },
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: normalizedRole,
        // Reset onboarding status if switching to non-buyer role
        onboardingStatus: normalizedRole === "BUYER" ? "COMPLETED" : "PENDING",
        hasCompletedOnboarding: normalizedRole === "BUYER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        role: true,
        isGoogleAuth: true,
        hasPassword: true,
        onboardingStatus: true,
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 },
    );
  }
}
