// app/api/user/payment-methods/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, last4, expiryMonth, expiryYear, bankName, accountNumber } =
      body;

    // Check if this is first payment method
    const existingCount = await prisma.paymentMethod.count({
      where: { userId: user.id },
    });

    const method = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        last4,
        expiryMonth,
        expiryYear,
        bankName,
        accountNumber,
        isDefault: existingCount === 0,
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
