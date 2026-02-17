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

    // Only filter if status is provided, otherwise return all
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [products, statusCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              businessName: true,
              city: true,
              state: true,
              verified: true,
              approved: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Build status counts
    const counts: Record<string, number> = {};
    let total = 0;
    for (const group of statusCounts) {
      counts[group.status] = group._count.id;
      total += group._count.id;
    }

    return NextResponse.json({
      products: products.length ? products : [],
      total,
      active: counts["ACTIVE"] || 0,
      inactive: counts["INACTIVE"] || 0,
      pending: counts["PENDING"] || 0,
    });
  } catch (error) {
    console.error("[ADMIN-PRODUCTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch products" },
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
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Validation error", message: "Product ID required" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!["ACTIVE", "INACTIVE", "PENDING", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
          message: "Invalid product status",
          details: { field: "status", value: status, allowed: ["ACTIVE", "INACTIVE", "PENDING", "REJECTED"] },
        },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json(
        { error: "Not found", message: `Product with ID ${productId} not found` },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        supplier: {
          select: { id: true, businessName: true, userId: true },
        },
      },
    });

    // Notify supplier about product status change
    if (product.supplier?.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: product.supplier.userId,
            type: "PRODUCT",
            title: status === "ACTIVE" ? "Product Approved" : "Product Status Updated",
            message: `Your product "${product.name}" has been ${status === "ACTIVE" ? "approved and is now live" : `marked as ${status}`}.`,
            link: `/dashboard/supplier/products/${product.id}`,
          },
        });
      } catch (notifErr) {
        console.error("[ADMIN-PRODUCTS] Notification error:", notifErr);
      }
    }

    console.log(`[ADMIN-PRODUCTS] Product ${productId} (${product.name}) status → ${status} by admin ${admin.id}`);

    return NextResponse.json({
      success: true,
      message: "Product status updated",
      product: {
        id: product.id,
        status: product.status,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("[ADMIN-PRODUCTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to update product" },
      { status: 500 }
    );
  }
}
