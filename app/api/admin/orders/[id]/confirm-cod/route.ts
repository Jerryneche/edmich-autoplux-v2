import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";

async function getAdminUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser?.role === "ADMIN") return authUser;
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") {
    return { id: session.user.id, role: "ADMIN" };
  }
  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<void | Response> {
  try {
    // Dual admin authentication
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const orderId = context.params.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    // Fetch order and validate

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.status !== "PENDING_COD_CONFIRMATION") {
      return NextResponse.json({ error: "Order is not pending COD confirmation." }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COD_CONFIRMED" },
    });


    // Notify buyer and supplier
    try {
      // Notify buyer
      await notificationService.notifyUserWithPush(order.userId, {
        type: "ORDER_STATUS_UPDATED",
        title: "Order COD Confirmed",
        message: `Your order #${order.id} has been confirmed as Cash on Delivery by admin.`,
        link: `/orders/${order.id}`,
        pushData: { orderId: order.id, status: "COD_CONFIRMED" },
      });
      // No supplierId on Order model; only notify buyer (userId)
    } catch (notifyErr) {
      // Log but do not fail the endpoint
      console.error("Notification error:", notifyErr);
    }

    return NextResponse.json({
      message: "Order COD confirmed successfully.",
      order: updatedOrder,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error.";
    console.error("COD confirm error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}