// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/:id
 * - `:id` can be either internal order id (cuid) or trackingId (EDM-...)
 * - The route will find the order and ensure the current session user is the owner.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

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
          orderTracking: {
            include: {
              driver: {
                select: { id: true, name: true, phone: true, email: true },
              },
              updates: { orderBy: { timestamp: "desc" }, take: 10 },
            },
          },
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
          orderTracking: {
            include: {
              driver: {
                select: { id: true, name: true, phone: true, email: true },
              },
              updates: { orderBy: { timestamp: "desc" }, take: 10 },
            },
          },
        },
      }));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/orders/:id
 * - Update order status (for admin/supplier use)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      order.userId !== user.id &&
      user.role !== "ADMIN" &&
      user.role !== "SUPPLIER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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

    if (status && order.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER",
          title: "Order Status Updated",
          message: `Your order ${order.trackingId || order.id} status has been updated to ${status}`,
          link: `/tracking/${order.id}`,
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
