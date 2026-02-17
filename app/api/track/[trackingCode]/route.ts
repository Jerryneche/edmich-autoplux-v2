// app/api/track/[trackingCode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ trackingCode: string }> },
) {
  try {
    const { trackingCode } = await context.params;

    if (!trackingCode) {
      return NextResponse.json(
        { error: "Missing tracking code" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { trackingId: trackingCode }, // adjust if your column name is trackingId
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true, price: true },
            },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("TRACK API ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
