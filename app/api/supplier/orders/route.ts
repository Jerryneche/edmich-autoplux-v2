// app/api/supplier/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch orders for supplier's products
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all products belonging to this supplier
    const supplierProducts = await prisma.product.findMany({
      where: { supplierId: session.user.id },
      select: { id: true },
    });

    const productIds = supplierProducts.map((p) => p.id);

    // Get all orders containing these products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: {
              in: productIds,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: {
              in: productIds, // Only include items from this supplier
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate supplier-specific totals for each order
    const ordersWithSupplierTotal = orders.map((order) => {
      const supplierTotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return {
        ...order,
        supplierTotal,
      };
    });

    return NextResponse.json(ordersWithSupplierTotal);
  } catch (error: any) {
    console.error("Error fetching supplier orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
