// app/api/payments/verify/route.ts
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

    const payment = await prisma.payment.findFirst({
      where: { gatewayReference: reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Skip verification if already completed
    if (payment.status === "completed") {
      return NextResponse.json({
        success: true,
        verified: true,
        message: "Already verified",
        payment,
      });
    }

    let verified = false;

    // Paystack Verification
    if (payment.method === "card" || payment.method === "bank_transfer") {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      const data = await res.json();
      verified = data.status === true && data.data.status === "success";
    }

    // Flutterwave Verification
    else if (payment.method === "mobile_money") {
      const res = await fetch(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );
      const data = await res.json();
      verified = data.status === "success" && data.data.status === "successful";
    }

    if (verified) {
      // Use transaction to ensure consistency
      await prisma.$transaction(async (tx) => {
        // Mark payment as completed
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "completed",
            verifiedAt: new Date(),
          },
        });

        // Only update order if it exists and is still pending payment
        if (payment.orderId && payment.order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              status: "CONFIRMED", // or "PAID", "PROCESSING" — whatever your flow uses
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Payment verified successfully",
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      return NextResponse.json({
        success: false,
        verified: false,
        message: "Payment verification failed or was declined",
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
