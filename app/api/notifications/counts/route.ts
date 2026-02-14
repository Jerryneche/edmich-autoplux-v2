import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getCurrentUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unread message count
    const messageCount = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        senderId: { not: user.id },
        read: false,
      },
    });

    // Get unread order count (for supplier/mechanic – orders they need to process)
    const orderCount = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              supplierId: user.id,
            },
          },
        },
        paymentStatus: "PAID",
      },
    });

    // Get unread notification count
    const notificationCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    // For admin: pending product approvals and pending payments
    let productCount = 0;
    let homeCount = 0;

    const userRole = (await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    }))?.role;

    if (userRole === "ADMIN") {
      // Pending product approvals
      productCount = await prisma.product.count({
        where: {
          status: "PENDING",
        },
      });

      // Pending payments for admin dashboard
      homeCount = await prisma.payment.count({
        where: {
          status: "pending",
        },
      });
    }

    return NextResponse.json({
      success: true,
      counts: {
        orders: orderCount,
        messages: messageCount,
        products: productCount,
        notifications: notificationCount,
        home: homeCount,
      },
    });
  } catch (error) {
    console.error("[COUNTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
