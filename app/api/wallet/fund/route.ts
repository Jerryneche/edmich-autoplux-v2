import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
          currency: "NGN",
        },
      });
    }

    // TODO: Integrate with Paystack/Flutterwave
    // For now, just return a success (in production, redirect to payment gateway)

    // Generate payment reference
    const reference = `FUND-${Date.now()}-${session.user.id.slice(0, 8)}`;

    // In production, you'd initialize payment with Paystack here
    // and return the payment URL

    return NextResponse.json({
      success: true,
      reference,
      // paymentUrl: paystackUrl, // In production
    });
  } catch (error) {
    console.error("Wallet fund error:", error);
    return NextResponse.json(
      { error: "Failed to fund wallet" },
      { status: 500 }
    );
  }
}
