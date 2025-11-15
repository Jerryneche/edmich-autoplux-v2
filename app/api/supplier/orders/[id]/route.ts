// app/api/supplier/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                supplierId: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify supplier owns at least one product in the order
    const supplierOwnsProduct = order.items.some(
      (item) => item.product.supplierId === session.user.id
    );

    if (!supplierOwnsProduct) {
      return NextResponse.json(
        { error: "Unauthorized to update this order" },
        { status: 403 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // 🔥 CREATE NOTIFICATION FOR BUYER
    const statusMessages: any = {
      CONFIRMED: `Your order #${order.trackingId} has been confirmed by the supplier and is being prepared for shipment.`,
      SHIPPED: `Your order #${order.trackingId} has been shipped! It's on the way to you.`,
      DELIVERED: `Your order #${order.trackingId} has been delivered! Thank you for shopping with us.`,
      CANCELLED: `Your order #${order.trackingId} has been cancelled by the supplier. Please contact support for more information.`,
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER",
          title: "Order Status Updated",
          message: statusMessages[status],
          link: `/track/${order.trackingId}`,
          read: false,
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
