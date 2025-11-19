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

    // Get supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
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
                name: true,
                price: true,
                image: true,
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

    // Calculate supplier's share for each order
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
