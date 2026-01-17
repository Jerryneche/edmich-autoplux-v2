// app/api/payment-methods/[id]/set-default/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// Helper to get user from either session or JWT
async function getUser(request: NextRequest) {
  // First try JWT (mobile)
  const jwtUser = await getAuthUser(request);
  if (jwtUser) return jwtUser;

  // Fallback to session (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id };
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Unset all defaults
    await prisma.paymentMethod.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Set new default
    const method = await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({ method });
  } catch (error) {
    console.error("Set default error:", error);
    return NextResponse.json(
      { error: "Failed to set default" },
      { status: 500 }
    );
  }
}
