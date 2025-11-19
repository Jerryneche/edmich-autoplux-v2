import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("PATCH called with orderId:", id);

    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);

    if (!session || session.user.role !== "ADMIN") {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    const { status } = body;

    if (!status) {
      console.error("No status provided");
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    console.log("Updating order in database...");
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                supplier: {
                  select: {
                    userId: true,
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("Order updated successfully:", updatedOrder.id);

    // Status messages
    const statusMessages: Record<string, string> = {
      PENDING: "is awaiting confirmation",
      PROCESSING: "is being processed",
      SHIPPED: "has been shipped and is on the way",
      DELIVERED: "has been delivered successfully",
      CANCELLED: "has been cancelled",
    };

    // 🔥 NOTIFY BUYER ABOUT STATUS CHANGE
    await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        type: "ORDER_STATUS_UPDATED",
        title: "Order Status Updated",
        message: `Your order #${updatedOrder.trackingId} ${
          statusMessages[status] || "status has been updated"
        }.`,
        link: `/dashboard/buyer/orders`,
      },
    });

    // 🔥 NOTIFY ALL SUPPLIERS WHOSE PRODUCTS ARE IN THIS ORDER
    const suppliersToNotify = new Set<{
      userId: string;
      businessName: string;
    }>();

    updatedOrder.items.forEach((item) => {
      if (item.product.supplier?.userId) {
        suppliersToNotify.add({
          userId: item.product.supplier.userId,
          businessName: item.product.supplier.businessName,
        });
      }
    });

    // Create notification for each supplier
    const supplierNotifications = Array.from(suppliersToNotify).map(
      (supplier) =>
        prisma.notification.create({
          data: {
            userId: supplier.userId,
            type: "ORDER_STATUS_UPDATED",
            title: "Order Status Updated",
            message: `Order #${
              updatedOrder.trackingId
            } has been updated to ${status}. ${
              status === "DELIVERED"
                ? "Payment processing will begin shortly."
                : status === "CANCELLED"
                ? "This order has been cancelled."
                : "Keep your inventory ready."
            }`,
            link: `/dashboard/supplier`,
          },
        })
    );

    await Promise.all(supplierNotifications);

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order:", error);
    console.error("Error details:", error.message, error.code);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
