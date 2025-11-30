import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, paymentMethods });
  } catch (error) {
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

    const {
      type,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      bankName,
      accountNumber,
    } = await request.json();

    let tokenizedData;

    if (type === "card") {
      // Tokenize card with payment gateway
      tokenizedData = await tokenizeCard({
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        last4: cardNumber?.slice(-4),
        expiryMonth,
        expiryYear,
        bankName,
        accountNumber,
        token: tokenizedData?.token,
        isDefault: false,
      },
    });

    return NextResponse.json({ success: true, paymentMethod });
  } catch (error) {
    console.error("Payment method error:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

async function tokenizeCard(cardData: any) {
  // In production, use Paystack or Flutterwave tokenization
  return {
    token: "tok_" + Math.random().toString(36).substr(2, 9),
  };
}
