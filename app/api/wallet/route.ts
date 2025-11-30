import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
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
      { status: 500 }
    );
  }
}
