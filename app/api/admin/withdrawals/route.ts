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
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [withdrawals, statusCounts] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { initiatedAt: "desc" },
      }),
      prisma.withdrawal.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Build status counts
    const counts: Record<string, number> = {};
    let total = 0;
    for (const group of statusCounts) {
      counts[group.status] = group._count.id;
      total += group._count.id;
    }

    return NextResponse.json({
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        userId: w.wallet.user.id,
        userName: w.wallet.user.name,
        userEmail: w.wallet.user.email,
        userPhone: w.wallet.user.phone,
        userRole: w.wallet.user.role,
        amount: w.amount,
        status: w.status,
        bankName: w.bankName,
        bankCode: w.bankCode,
        accountNumber: w.accountNumber,
        accountName: w.accountName,
        reference: w.reference,
        requestedAt: w.initiatedAt,
        initiatedAt: w.initiatedAt,
        processedAt: w.processedAt,
        processedBy: w.processedBy,
        user: {
          id: w.wallet.user.id,
          name: w.wallet.user.name,
          email: w.wallet.user.email,
          phone: w.wallet.user.phone,
          role: w.wallet.user.role,
          wallet: {
            balance: w.wallet.balance,
          },
        },
      })),
      total,
      pending: counts["pending"] || 0,
      processing: counts["processing"] || 0,
      credited: counts["credited"] || 0,
      failed: counts["failed"] || 0,
    });
  } catch (error) {
    console.error("[ADMIN-WITHDRAWALS-GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

// PATCH update withdrawal status
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const withdrawalId = searchParams.get("id");

    if (!withdrawalId) {
      return NextResponse.json(
        { error: "Validation error", message: "Withdrawal ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status || !["pending", "processing", "credited", "failed"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
          message: "Invalid withdrawal status",
          details: { field: "status", value: status, allowed: ["pending", "processing", "credited", "failed"] },
        },
        { status: 400 }
      );
    }

    // Fetch existing withdrawal
    const existing = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        wallet: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Not found", message: `Withdrawal with ID ${withdrawalId} not found` },
        { status: 404 }
      );
    }

    // Validate status transitions
    const invalidTransitions: Record<string, string[]> = {
      credited: ["pending", "processing", "failed"],
      failed: ["pending", "processing", "credited"],
    };
    if (invalidTransitions[existing.status]?.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition", message: `Cannot change status from ${existing.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update withdrawal
    const withdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        processedAt: ["processing", "credited", "failed"].includes(status) ? new Date() : null,
        processedBy: admin.id,
      },
    });

    const userId = existing.wallet.user.id;
    const amount = existing.amount.toLocaleString();

    // Handle wallet transactions based on status
    if (status === "credited") {
      // Deduct from wallet balance (the funds were already "locked" when request was made)
      await prisma.wallet.update({
        where: { id: existing.walletId },
        data: {
          balance: { decrement: existing.amount },
        },
      });

      // Create wallet transaction record
      await prisma.walletTransaction.create({
        data: {
          walletId: existing.walletId,
          type: "debit",
          amount: existing.amount,
          description: `Withdrawal credited: ${existing.accountName} (${existing.accountNumber})`,
          reference: existing.reference,
        },
      });

      // Notify supplier
      try {
        await prisma.notification.create({
          data: {
            userId,
            type: "PAYMENT",
            title: "Withdrawal Credited",
            message: `₦${amount} has been credited to your ${existing.bankName || "bank"} account (${existing.accountNumber}).`,
            link: "/wallet",
          },
        });
      } catch (notifErr) {
        console.error("[ADMIN-WITHDRAWALS] Notification error:", notifErr);
      }
    } else if (status === "failed") {
      // Notify supplier about failure
      try {
        await prisma.notification.create({
          data: {
            userId,
            type: "PAYMENT",
            title: "Withdrawal Failed",
            message: `Your withdrawal of ₦${amount} has failed.${note ? ` Reason: ${note}` : ""} The funds remain in your wallet.`,
            link: "/wallet",
          },
        });
      } catch (notifErr) {
        console.error("[ADMIN-WITHDRAWALS] Notification error:", notifErr);
      }
    } else if (status === "processing") {
      // Notify supplier about processing
      try {
        await prisma.notification.create({
          data: {
            userId,
            type: "PAYMENT",
            title: "Withdrawal Processing",
            message: `Your withdrawal of ₦${amount} is being processed.`,
            link: "/wallet",
          },
        });
      } catch (notifErr) {
        console.error("[ADMIN-WITHDRAWALS] Notification error:", notifErr);
      }
    }

    console.log(`[ADMIN-WITHDRAWAL] Withdrawal ${withdrawalId} status → ${status} by admin ${admin.id}`);

    return NextResponse.json({
      success: true,
      message: `Withdrawal marked as ${status}`,
      withdrawal: {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: withdrawal.amount,
        processedAt: withdrawal.processedAt,
        processedBy: withdrawal.processedBy,
        note: note || null,
      },
    });
  } catch (error) {
    console.error("[ADMIN-WITHDRAWALS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to update withdrawal" },
      { status: 500 }
    );
  }
}
