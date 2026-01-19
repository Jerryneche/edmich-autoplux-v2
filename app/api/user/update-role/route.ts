// app/api/user/update-role/route.ts
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

const VALID_ROLES = ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

// POST - Update user role
export async function POST(req: NextRequest) {
  console.log("[UPDATE ROLE] Starting...");

  try {
    const { user, error } = await getAuthUserFromToken(req);

    if (!user) {
      console.log("[UPDATE ROLE] Auth failed:", error);
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { role } = body;

    console.log(
      "[UPDATE ROLE] Requested role:",
      role,
      "Current role:",
      user.role,
    );

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    if (role === user.role) {
      return NextResponse.json({
        success: true,
        message: "Role unchanged",
        user: {
          id: user.id,
          role: user.role,
        },
      });
    }

    // Determine onboarding status based on new role
    // BUYER doesn't need onboarding, others do
    const needsOnboarding = role !== "BUYER";

    // Update user role and reset onboarding if switching to non-buyer role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role,
        // Reset onboarding status if switching to a role that requires it
        ...(needsOnboarding && {
          onboardingStatus: "PENDING",
          hasCompletedOnboarding: false,
        }),
        // If switching to BUYER, mark as completed
        ...(!needsOnboarding && {
          onboardingStatus: "COMPLETED",
          hasCompletedOnboarding: true,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingStatus: true,
        hasCompletedOnboarding: true,
      },
    });

    console.log("[UPDATE ROLE] Success:", updatedUser.role);

    return NextResponse.json({
      success: true,
      message: needsOnboarding
        ? `Role updated to ${role}. Please complete onboarding.`
        : `Role updated to ${role}`,
      user: updatedUser,
      needsOnboarding,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[UPDATE ROLE] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
