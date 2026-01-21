// app/api/supplier/orders/route.ts
// ===========================================
// SUPPLIER ORDERS API - WITH STATUS MANAGEMENT
// Suppliers can view their orders and update status
// ===========================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get user from either JWT (mobile) or session (web)
async function getCurrentUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SUPPLIER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only suppliers can access this endpoint" },
        { status: 403 },
      );
    }

    // Get supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json([]);
    }

    // Get orders that contain this supplier's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              supplierId: supplierProfile.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          where: {
            product: {
              supplierId: supplierProfile.id,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate supplier total for each order
    const ordersWithSupplierTotal = orders.map((order) => {
      const supplierTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return {
        ...order,
        supplierTotal,
      };
    });

    return NextResponse.json(ordersWithSupplierTotal);
  } catch (error) {
    console.error("Supplier orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
