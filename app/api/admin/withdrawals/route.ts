import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getAdminUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser?.role === "ADMIN") return authUser;

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") {
    return { id: session.user.id, role: "ADMIN" };
  }

  return null;
}

// GET admin withdrawal queue
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const withdrawals = await prisma.withdrawal.findMany({
      where: { status },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { initiatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: withdrawals.length,
      status,
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        userId: w.wallet.user.id,
        userName: w.wallet.user.name,
        userEmail: w.wallet.user.email,
        amount: w.amount,
        status: w.status,
        bankName: w.bankName,
        bankCode: w.bankCode,
        accountNumber: w.accountNumber,
        accountName: w.accountName,
        reference: w.reference,
        initiatedAt: w.initiatedAt,
        processedAt: w.processedAt,
        processedBy: w.processedBy,
      })),
    });
  } catch (error) {
    console.error("[ADMIN-WITHDRAWALS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

// PATCH update withdrawal status
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const withdrawalId = searchParams.get("id");

    if (!withdrawalId) {
      return NextResponse.json(
        { error: "Withdrawal ID required" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!["pending", "processing", "credited", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update withdrawal
    const withdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        processedAt: status === "credited" || status === "failed" ? new Date() : null,
        processedBy: admin.id,
      },
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // If marked as credited, add funds to wallet (reverse the deduction)
    if (status === "credited") {
      await prisma.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balance: { increment: withdrawal.amount },
        },
      });

      // Log credit transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: withdrawal.walletId,
          type: "credit",
          amount: withdrawal.amount,
          description: `Withdrawal ${status}: ${withdrawal.accountName} (${withdrawal.accountNumber})`,
          reference: withdrawal.reference,
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: withdrawal.wallet.user.id,
          type: "PAYMENT",
          title: "Withdrawal Completed",
          message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been processed and credited. Reference: ${withdrawal.reference}`,
          link: "/wallet",
        },
      });
    }

    const timestamp = new Date().toISOString();
    console.log(`[ADMIN-WITHDRAWAL] Withdrawal ${withdrawalId} status changed to ${status} by admin ${admin.id} at ${timestamp}`);

    return NextResponse.json({
      success: true,
      message: `Withdrawal marked as ${status}`,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        accountName: withdrawal.accountName,
        accountNumber: withdrawal.accountNumber,
        processedBy: withdrawal.processedBy,
        processedAt: withdrawal.processedAt,
      },
    });
  } catch (error) {
    console.error("[ADMIN-WITHDRAWALS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update withdrawal" },
      { status: 500 }
    );
  }
}
