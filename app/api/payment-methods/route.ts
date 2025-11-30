import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Payment methods fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, last4, expiryMonth, expiryYear, bankName, accountNumber } =
      body;

    // Check if this is first payment method
    const existingCount = await prisma.paymentMethod.count({
      where: { userId: session.user.id },
    });

    const method = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        last4,
        expiryMonth,
        expiryYear,
        bankName,
        accountNumber,
        isDefault: existingCount === 0, // First one is default
      },
    });

    return NextResponse.json({ method });
  } catch (error) {
    console.error("Payment method creation error:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}
