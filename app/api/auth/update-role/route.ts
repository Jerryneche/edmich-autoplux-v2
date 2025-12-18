// app/api/auth/update-role/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // BUYER = complete, others = need onboarding
    const onboardingStatus = role === "BUYER" ? "COMPLETED" : "PENDING";
    const hasCompletedOnboarding = role === "BUYER";

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        role,
        onboardingStatus,
        hasCompletedOnboarding,
      },
    });

    console.log(
      `[UPDATE-ROLE] ${normalizedEmail} -> ${role} (${onboardingStatus})`
    );

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error: any) {
    console.error("[UPDATE-ROLE] Error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
