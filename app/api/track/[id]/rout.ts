// app/api/track/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id: raw } = await params;
    const id = raw?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Missing tracking code" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ trackingId: id }, { id }] },
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
