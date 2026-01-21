// app/api/wallet/transactions/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
export async function GET_TRANSACTIONS(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json({ transactions: [] });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
