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

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    // Build filter — return ALL if no status provided
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status.toLowerCase();
    }
    if (method) {
      where.method = { in: method.split("|") };
    }

    const [payments, statusCounts] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          order: {
            select: {
              id: true,
              trackingId: true,
              total: true,
              paymentStatus: true,
              paymentMethod: true,
              status: true,
              createdAt: true,
              items: {
                include: {
                  product: {
                    select: { id: true, name: true, price: true, image: true },
                  },
                },
              },
              shippingAddress: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Build status counts
    const counts: Record<string, number> = {};
    let total = 0;
    for (const group of statusCounts) {
      counts[group.status.toUpperCase()] = group._count.id;
      total += group._count.id;
    }

    return NextResponse.json({
      payments,
      total,
      pending: counts["PENDING"] || 0,
      paid: counts["PAID"] || 0,
      failed: counts["FAILED"] || 0,
    });
  } catch (error) {
    console.error("[ADMIN-PAYMENTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Validation error", message: "Payment ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status || !["PAID", "FAILED"].includes(status.toUpperCase())) {
      return NextResponse.json(
        {
          error: "Invalid status",
          message: "Status must be PAID or FAILED",
          details: { field: "status", value: status, allowed: ["PAID", "FAILED"] },
        },
        { status: 400 }
      );
    }

    const normalizedStatus = status.toLowerCase();

    // Find the payment first
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, user: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Not found", message: `Payment with ID ${paymentId} not found` },
        { status: 404 }
      );
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: normalizedStatus,
        verifiedAt: normalizedStatus === "paid" ? new Date() : null,
      },
    });

    // If payment is marked PAID, update order payment status
    if (normalizedStatus === "paid" && existingPayment.orderId) {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
        },
      });
    }

    // Send notification to buyer
    try {
      const amount = existingPayment.amount.toLocaleString();
      if (normalizedStatus === "paid") {
        await prisma.notification.create({
          data: {
            userId: existingPayment.userId,
            type: "PAYMENT",
            title: "Payment Confirmed",
            message: `Your payment of ₦${amount} has been confirmed.`,
            link: existingPayment.orderId ? `/orders/${existingPayment.orderId}` : "/wallet",
          },
        });
      } else if (normalizedStatus === "failed") {
        await prisma.notification.create({
          data: {
            userId: existingPayment.userId,
            type: "PAYMENT",
            title: "Payment Failed",
            message: `Your payment of ₦${amount} has been marked as failed.${note ? ` Reason: ${note}` : ""}`,
            link: existingPayment.orderId ? `/orders/${existingPayment.orderId}` : "/wallet",
          },
        });
      }
    } catch (notifErr) {
      console.error("[ADMIN-PAYMENTS] Notification error:", notifErr);
    }

    console.log(`[ADMIN-PAYMENTS] Payment ${paymentId} marked as ${status} by admin ${admin.id}`);

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
      payment: {
        id: payment.id,
        status: status.toUpperCase(),
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error) {
    console.error("[ADMIN-PAYMENTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to update payment" },
      { status: 500 }
    );
  }
}
  }
}
