// app/api/payment/initialize/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount, email } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Order ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate unique reference
    const reference = `EDM-${orderId}-${Date.now()}`;

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || session.user.email,
          amount: Math.round(amount * 100), // Convert to kobo
          reference,
          callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
          metadata: {
            orderId,
            userId: session.user.id,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Update order with payment reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentReference: reference,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
