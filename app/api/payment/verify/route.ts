// app/api/payment/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: "Verification failed", verified: false },
        { status: 400 }
      );
    }

    const { status, amount, metadata } = paystackData.data;

    if (status === "success") {
      // Update order status
      const order = await prisma.order.findFirst({
        where: { paymentReference: reference },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            paidAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Payment verified successfully",
        data: {
          reference,
          amount: amount / 100, // Convert from kobo
          orderId: metadata?.orderId,
        },
      });
    }

    return NextResponse.json({
      success: false,
      verified: false,
      message: `Payment ${status}`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
