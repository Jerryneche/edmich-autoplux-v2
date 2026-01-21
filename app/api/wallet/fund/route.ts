// app/api/wallet/fund/route.ts
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Ensure wallet exists
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          currency: "NGN",
        },
      });
    }

    // Generate payment reference
    const reference = `FUND-${Date.now()}-${user.id.slice(0, 8)}`;

    // TODO: Initialize Paystack payment here
    // For now, return reference for frontend to handle

    return NextResponse.json({
      success: true,
      reference,
      walletId: wallet.id,
      // paymentUrl: paystackUrl, // In production
    });
  } catch (error) {
    console.error("Wallet fund error:", error);
    return NextResponse.json(
      { error: "Failed to initialize wallet funding" },
      { status: 500 },
    );
  }
}
