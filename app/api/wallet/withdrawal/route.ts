import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, bankCode, accountNumber } = await request.json();

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet || wallet.balance < parseFloat(amount)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        walletId: wallet.id,
        amount: parseFloat(amount),
        bankCode,
        accountNumber,
        status: "pending",
      },
    });

    // Process withdrawal with payment gateway
    const transferResponse = await initiateTransfer({
      amount: parseFloat(amount),
      accountNumber,
      bankCode,
      reference: withdrawal.id,
    });

    if (transferResponse.success) {
      // Deduct from wallet
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: parseFloat(amount) },
        },
      });

      // Create transaction record
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "debit",
          amount: parseFloat(amount),
          description: "Withdrawal to bank account",
          reference: withdrawal.id,
        },
      });

      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "completed" },
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal successful",
        withdrawal,
      });
    } else {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "failed" },
      });

      return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}

async function initiateTransfer(data: any) {
  // Integrate with Paystack or Flutterwave transfer API
  // For now, return mock response
  return { success: true };
}
