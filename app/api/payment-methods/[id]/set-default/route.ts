import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Unset all defaults
    await prisma.paymentMethod.updateMany({
      where: { userId: session.user.id },
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
