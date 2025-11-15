// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/:id
 * - `:id` can be either internal order id (cuid) or trackingId (EDM-...)
 * - The route will find the order and ensure the current session user is the owner.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // unwrap dynamic params

    // Attempt to fetch by internal id first, then by trackingId
    const order =
      (await prisma.order.findUnique({
        where: { id },
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
      })) ||
      (await prisma.order.findUnique({
        where: { trackingId: id },
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
      }));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure current user owns the order (buyer)
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
