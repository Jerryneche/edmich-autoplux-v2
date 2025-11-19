import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPPLIER") {
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

    // Find products with low stock (< 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        supplierId: supplierProfile.id,
        stock: {
          lt: 5,
        },
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    // Create notifications for low stock products
    if (lowStockProducts.length > 0) {
      // Check if notification already exists for each product
      for (const product of lowStockProducts) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: session.user.id,
            type: "LOW_INVENTORY",
            message: {
              contains: product.name,
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
            },
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: session.user.id,
              type: "LOW_INVENTORY",
              title: "Low Stock Alert",
              message: `${product.name} is running low on stock. Only ${product.stock} units remaining.`,
              link: `/dashboard/supplier/products/${product.id}/edit`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      lowStockCount: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error("Error checking inventory:", error);
    return NextResponse.json(
      { error: "Failed to check inventory" },
      { status: 500 }
    );
  }
}
