// app/api/auth/google-role-selection/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();

    if (!["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Role selected successfully!",
      role,
    });
  } catch (error: any) {
    console.error("Role selection error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
