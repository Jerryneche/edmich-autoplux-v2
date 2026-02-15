import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to get admin user
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    // Build filter
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (method) {
      where.method = {
        in: method.split("|"),
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: {
            id: true,
            trackingId: true,
            total: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("[ADMIN-PAYMENTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID required" },
        { status: 400 }
      );
    }

    const { status, note } = await request.json();

    if (!["PAID", "FAILED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status.toLowerCase(),
        verifiedAt: status === "PAID" ? new Date() : null,
      },
      include: {
        order: true,
        user: true,
      },
    });

    // If payment is marked PAID, update order payment status
    if (status === "PAID" && payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
        },
      });

      // Log admin action
      console.log(`[ADMIN-PAYMENTS] Payment ${paymentId} marked as PAID by admin ${admin.id}`);
    }

    return NextResponse.json({
      success: true,
      message: "Payment updated",
      payment,
      note,
    });
  } catch (error) {
    console.error("[ADMIN-PAYMENTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
