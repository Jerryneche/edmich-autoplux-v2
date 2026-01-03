// app/api/supplier/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Get all orders that contain products from this supplier
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
            name: true,
            email: true,
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
        shippingAddress: true, // Include shipping address
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate supplier total for each order
    const ordersWithSupplierTotal = orders.map((order) => {
      const supplierTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        id: order.id,
        trackingId: order.trackingId,
        status: order.status,
        total: order.total,
        supplierTotal,
        createdAt: order.createdAt,
        user: order.user,
        items: order.items,
        shippingAddress: order.shippingAddress,
      };
    });

    return NextResponse.json(ordersWithSupplierTotal);
  } catch (error: any) {
    console.error("Supplier orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
