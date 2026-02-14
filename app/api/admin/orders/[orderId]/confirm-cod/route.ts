import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod?.toUpperCase() !== "COD") {
      return NextResponse.json(
        { error: "Order payment method is not COD" },
        { status: 400 }
      );
    }

    // Create COD payment record if not exists
    let payment = order.payments.find((p) => p.method?.toUpperCase() === "COD");

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          amount: order.total,
          method: "COD",
          status: "paid",
          verifiedAt: new Date(),
        },
      });
    } else {
      // Update existing COD payment
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          verifiedAt: new Date(),
        },
      });
    }

    // Mark order as PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
      include: {
        user: true,
        items: true,
      },
    });

    // Log action
    console.log(
      `[COD-CONFIRM] Order ${orderId} COD payment confirmed by admin ${admin.id} at ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      message: "COD payment confirmed",
      order: updatedOrder,
      payment,
      confirmedBy: admin.id,
      confirmedAt: new Date(),
    });
  } catch (error) {
    console.error("[COD-CONFIRM] Error:", error);
    return NextResponse.json(
      { error: "Failed to confirm COD payment" },
      { status: 500 }
    );
  }
}
