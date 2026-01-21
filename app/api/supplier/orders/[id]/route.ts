import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }
  return null;
}

// Valid status transitions for suppliers
const SUPPLIER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: [], // Buyer marks as delivered
  DELIVERED: [],
  CANCELLED: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SUPPLIER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only suppliers can update order status" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Get order with supplier verification
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                supplier: true,
              },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify supplier owns products in this order
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 },
      );
    }

    const ownsProducts = order.items.some(
      (item) => item.product.supplierId === supplierProfile.id,
    );

    if (!ownsProducts && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to update this order" },
        { status: 403 },
      );
    }

    // Validate status transition
    const allowedStatuses = SUPPLIER_TRANSITIONS[order.status] || [];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot change status from ${order.status} to ${status}`,
          allowedStatuses,
        },
        { status: 400 },
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // Notify buyer
    const timestamp = new Date().toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const notificationMessages: Record<
      string,
      { title: string; message: string }
    > = {
      CONFIRMED: {
        title: "Order Confirmed! ✅",
        message: `Your order #${order.trackingId} has been confirmed by the seller. It will be shipped soon. (${timestamp})`,
      },
      SHIPPED: {
        title: "Order Shipped! 🚚",
        message: `Great news! Your order #${order.trackingId} has been shipped and is on its way. (${timestamp})`,
      },
      CANCELLED: {
        title: "Order Cancelled",
        message: `Your order #${order.trackingId} has been cancelled. (${timestamp})`,
      },
    };

    const notification = notificationMessages[status];
    if (notification) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER",
          title: notification.title,
          message: notification.message,
          link: `/orders/${order.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
