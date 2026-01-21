// app/api/wallet/route.ts - Get wallet
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          currency: "NGN",
        },
      });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}
