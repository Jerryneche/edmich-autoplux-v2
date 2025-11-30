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

    const { amount, bankCode, accountNumber } = await request.json();

    if (!amount || amount <= 0 || !bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "Invalid withdrawal details" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        walletId: wallet.id,
        amount,
        bankCode,
        accountNumber,
        status: "pending",
        reference: `WD-${Date.now()}-${session.user.id.slice(0, 8)}`,
      },
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "debit",
        amount,
        description: "Withdrawal to bank",
        reference: withdrawal.reference,
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
