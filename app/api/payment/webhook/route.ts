// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing signature or key" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference } = event.data;

      const order = await prisma.order.findFirst({
        where: { paymentReference: reference },
      });

      if (order && order.status !== "CONFIRMED") {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            paidAt: new Date(),
          },
        });

        if (updatedOrder.tradeInId) {
          await prisma.tradeIn.update({
            where: { id: updatedOrder.tradeInId },
            data: { status: "SETTLED" },
          });
        }

        if (updatedOrder.tradeInOfferId) {
          await prisma.tradeInOffer.update({
            where: { id: updatedOrder.tradeInOfferId },
            data: { status: "SETTLED" },
          });
        }

        console.log(`Order ${order.id} confirmed via webhook`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
