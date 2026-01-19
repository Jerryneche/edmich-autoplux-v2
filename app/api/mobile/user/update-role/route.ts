// app/api/mobile/user/update-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

// POST - Update user role
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    // Get current user role
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (role === currentUser?.role) {
      return NextResponse.json({
        success: true,
        message: "Role unchanged",
        user: { id: user.id, role: role },
        needsOnboarding: false,
      });
    }

    // Determine if onboarding is needed
    const needsOnboarding = role !== "BUYER";

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role,
        // Reset onboarding status if switching to a role that requires it
        ...(needsOnboarding && {
          onboardingStatus: "PENDING",
          hasCompletedOnboarding: false,
        }),
        // If switching to BUYER, mark as completed (no onboarding needed)
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

    return NextResponse.json({
      success: true,
      message: needsOnboarding
        ? `Role updated to ${role}. Please complete onboarding.`
        : `Role updated to ${role}`,
      user: updatedUser,
      needsOnboarding,
    });
  } catch (error: unknown) {
    console.error("[MOBILE UPDATE ROLE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
