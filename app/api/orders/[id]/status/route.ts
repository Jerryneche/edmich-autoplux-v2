// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// Valid status transitions
const SUPPLIER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: [],
  DELIVERED: [],
  CANCELLED: [],
};

const BUYER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: [],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              include: { supplier: { select: { userId: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const supplierUserId = order.items[0]?.product?.supplier?.userId;
    const isBuyer = order.userId === user.id;
    const isSupplier = supplierUserId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to update this order" },
        { status: 403 },
      );
    }

    const currentStatus = order.status;
    let allowedStatuses: string[] = [];

    if (isAdmin) {
      allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];
    } else if (isSupplier) {
      allowedStatuses = SUPPLIER_TRANSITIONS[currentStatus] || [];
    } else if (isBuyer) {
      allowedStatuses = BUYER_TRANSITIONS[currentStatus] || [];
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot change status from ${currentStatus} to ${status}`,
          allowedStatuses,
        },
        { status: 400 },
      );
    }

    if (
      (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") &&
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "SUCCESS"
    ) {
      return NextResponse.json(
        { error: "Payment not confirmed" },
        { status: 403 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === "DELIVERED" &&
          order.paymentMethod === "CASH_ON_DELIVERY" && {
            paymentStatus: "PAID",
            paidAt: new Date(),
          }),
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
          },
        },
        shippingAddress: true,
      },
    });

    const timestamp = new Date().toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const notificationData = getNotificationData(
      status,
      order.trackingId,
      timestamp,
      order.id,
    );

    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER",
        title: notificationData.buyerTitle,
        message: notificationData.buyerMessage,
        link: `/orders/${order.id}`,
      },
    });

    if (supplierUserId && supplierUserId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: supplierUserId,
          type: "ORDER",
          title: notificationData.supplierTitle,
          message: notificationData.supplierMessage,
          link: `/dashboard/supplier`,
        },
      });
    }

    if (status === "DELIVERED" && supplierUserId) {
      await creditSupplierWallet(order, supplierUserId);
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

function getNotificationData(
  status: string,
  trackingId: string,
  timestamp: string,
  orderId: string,
) {
  const notifications: Record<string, any> = {
    CONFIRMED: {
      buyerTitle: "Order Confirmed! ✅",
      buyerMessage: `Your order #${trackingId} has been confirmed by the seller. It will be shipped soon. (${timestamp})`,
      supplierTitle: "Order Confirmed",
      supplierMessage: `You confirmed order #${trackingId}. Please prepare it for shipping. (${timestamp})`,
    },
    SHIPPED: {
      buyerTitle: "Order Shipped! 🚚",
      buyerMessage: `Great news! Your order #${trackingId} has been shipped and is on its way to you. (${timestamp})`,
      supplierTitle: "Order Shipped",
      supplierMessage: `Order #${trackingId} has been marked as shipped. (${timestamp})`,
    },
    DELIVERED: {
      buyerTitle: "Order Delivered! 🎉",
      buyerMessage: `Your order #${trackingId} has been marked as delivered. Thank you for shopping with EDMICH! (${timestamp})`,
      supplierTitle: "Order Delivered! 💰",
      supplierMessage: `Order #${trackingId} has been delivered and confirmed by the buyer. Revenue has been added to your wallet. (${timestamp})`,
    },
    CANCELLED: {
      buyerTitle: "Order Cancelled",
      buyerMessage: `Your order #${trackingId} has been cancelled. (${timestamp})`,
      supplierTitle: "Order Cancelled",
      supplierMessage: `Order #${trackingId} has been cancelled. (${timestamp})`,
    },
  };

  return (
    notifications[status] || {
      buyerTitle: "Order Update",
      buyerMessage: `Your order #${trackingId} status has been updated to ${status}. (${timestamp})`,
      supplierTitle: "Order Update",
      supplierMessage: `Order #${trackingId} status has been updated to ${status}. (${timestamp})`,
    }
  );
}

async function creditSupplierWallet(order: any, supplierUserId?: string) {
  try {
    if (!order) return;
    // Wallet credit logic here
  } catch (error) {
    console.error("Failed to credit supplier wallet:", error);
  }
}

// GET - Get order status history
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

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        trackingId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      order.userId !== user.id &&
      user.role !== "SUPPLIER" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      orderId: order.id,
      trackingId: order.trackingId,
      currentStatus: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: "Failed to fetch order status" },
      { status: 500 },
    );
  }
}
