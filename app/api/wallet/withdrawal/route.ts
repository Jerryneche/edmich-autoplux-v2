// app/api/wallet/withdraw/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }
  return null;
}
export async function POST_WITHDRAW(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, bankCode, accountNumber } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (amount < 1000) {
      return NextResponse.json(
        { error: "Minimum withdrawal is ₦1,000" },
        { status: 400 },
      );
    }

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "Bank code and account number are required" },
        { status: 400 },
      );
    }

    if (accountNumber.length < 10) {
      return NextResponse.json(
        { error: "Invalid account number" },
        { status: 400 },
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    // Create withdrawal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amount,
          bankCode,
          accountNumber,
          status: "pending",
          reference: `WD-${Date.now()}-${user.id.slice(0, 8)}`,
        },
      });

      // Deduct from wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Create transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "debit",
          amount,
          description: `Withdrawal to bank (${accountNumber})`,
          reference: withdrawal.reference,
        },
      });

      return withdrawal;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PAYMENT",
        title: "Withdrawal Requested",
        message: `Your withdrawal of ₦${amount.toLocaleString()} has been initiated. Reference: ${result.reference}`,
        link: "/wallet",
      },
    });

    // TODO: In production, integrate with Paystack/Flutterwave Transfer API
    // to actually process the bank transfer

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal: result,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 },
    );
  }
}
