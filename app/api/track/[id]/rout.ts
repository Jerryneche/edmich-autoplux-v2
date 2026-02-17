// app/api/track/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const trackingId = id?.trim();

    if (!trackingId) {
      return NextResponse.json(
        { error: "Missing tracking code" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ trackingId }, { id: trackingId }] },
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
  } catch (err: any) {
    console.error("track api error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
