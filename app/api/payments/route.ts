import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

// POST /api/payments
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, method, reference } = body;
    if (!orderId || !amount || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine initial status
    let status: "PENDING" | "SUCCESS" = "PENDING";
    if (["CARD", "WALLET"].includes(method.toUpperCase())) {
      // For instant methods, status remains PENDING until gateway confirms
      status = "PENDING";
    } else if (["BANK TRANSFER", "PAY ON DELIVERY"].includes(method.toUpperCase())) {
      status = "PENDING";
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        orderId,
        amount,
        method,
        status,
        reference: reference || null,
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[PAYMENTS-POST] Error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
