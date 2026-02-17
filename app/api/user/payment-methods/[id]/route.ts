// app/api/user/payment-methods/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const method = await prisma.paymentMethod.findFirst({
      where: { id, userId: user.id },
    });

    if (!method) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 },
      );
    }

    await prisma.paymentMethod.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment method deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.paymentMethod.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    const method = await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({ method });
  } catch (error) {
    console.error("Set default error:", error);
    return NextResponse.json(
      { error: "Failed to set default" },
      { status: 500 },
    );
  }
}
