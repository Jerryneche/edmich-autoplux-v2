// app/api/wallet/withdrawal/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Helper to get user from either JWT (mobile) or session (web)
async function getCurrentUser(request: NextRequest) {
  // Try JWT first (mobile)
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;

  // Fall back to session (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }

  return null;
}

// GET user's withdrawal history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { walletId: wallet.id },
      select: {
        id: true,
        amount: true,
        status: true,
        bankName: true,
        bankCode: true,
        accountNumber: true,
        accountName: true,
        initiatedAt: true,
        processedAt: true,
        reference: true,
      },
      orderBy: { initiatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("[WALLET-WITHDRAWALS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, bankCode, accountNumber, accountName, bankName } = await request.json();

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

    // Get wallet and user details
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.balance <= 0) {
      return NextResponse.json(
        { error: "Your wallet balance is zero. Please fund your wallet before making a withdrawal." },
        { status: 400 },
      );
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    // Create withdrawal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create withdrawal record with bankName and accountName
      const withdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          amount,
          bankCode,
          bankName: bankName || null,
          accountNumber,
          accountName: accountName || null,
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
          description: `Withdrawal to ${bankName || "bank"} (${accountNumber})`,
          reference: withdrawal.reference,
        },
      });

      return withdrawal;
    });

    // Send email notification to admin
    try {
      const emailSubject = `New Wallet Withdrawal Request - ${result.reference}`;
      const emailBody = `
        <h2>Wallet Withdrawal Request</h2>
        <p><strong>Reference:</strong> ${result.reference}</p>
        
        <h3>User Details</h3>
        <ul>
          <li><strong>Name:</strong> ${userData?.name || "N/A"}</li>
          <li><strong>Email:</strong> ${userData?.email || "N/A"}</li>
          <li><strong>User ID:</strong> ${user.id}</li>
        </ul>
        
        <h3>Withdrawal Details</h3>
        <ul>
          <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
          <li><strong>Bank Name:</strong> ${bankName || "Not provided"}</li>
          <li><strong>Bank Code:</strong> ${bankCode}</li>
          <li><strong>Account Number:</strong> ${accountNumber}</li>
          <li><strong>Account Name:</strong> ${accountName || "Not provided"}</li>
          <li><strong>Status:</strong> Pending</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>
        
        <p><em>Please process this withdrawal within 24 hours on business days.</em></p>
      `;

      await sendEmail(
        "edmichservices@gmail.com",
        emailSubject,
        emailBody
      );

      console.log("[WITHDRAWAL] Email sent to admin:", {
        reference: result.reference,
        amount,
        accountNumber: accountNumber.slice(0, 4) + "****",
      });
    } catch (emailError) {
      console.error("[WITHDRAWAL] Failed to send admin email:", emailError);
      // Don't fail the withdrawal if email fails
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PAYMENT",
        title: "Withdrawal Requested",
        message: `Your withdrawal of ₦${amount.toLocaleString()} has been initiated. Reference: ${result.reference}`,
        link: "/wallet",
      },
    });

    console.log("[WITHDRAWAL] Withdrawal created successfully:", {
      reference: result.reference,
      userId: user.id,
      amount,
      bankCode,
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal: result,
    });
  } catch (error) {
    console.error("[WITHDRAWAL] Error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 },
    );
  }
}
