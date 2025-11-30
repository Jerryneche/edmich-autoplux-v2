// app/api/wallet/transactions/route.ts
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "credit" | "debit" | "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // safety cap

    const where: any = {
      wallet: { userId: session.user.id },
    };

    if (type && type !== "all") {
      where.type = type.toLowerCase();
    }

    const transactions = await prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        order: {
          select: {
            trackingId: true, // This is your order number (e.g. EDM-abc123)
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    // Optional: rename trackingId → orderNumber in response for frontend
    const formattedTransactions = transactions.map((t) => ({
      ...t,
      orderNumber: t.order?.trackingId || null,
      order: t.order
        ? {
            ...t.order,
            orderNumber: t.order.trackingId,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      count: formattedTransactions.length,
    });
  } catch (error: any) {
    console.error("Wallet transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
