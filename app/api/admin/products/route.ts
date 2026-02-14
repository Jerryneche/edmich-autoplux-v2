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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const products = await prisma.product.findMany({
      where: { status },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            verified: true,
            approved: true,
          },
        },
        reviews: {
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      status,
      products,
    });
  } catch (error) {
    console.error("[ADMIN-PRODUCTS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!["ACTIVE", "INACTIVE", "PENDING", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        supplier: {
          select: { id: true, businessName: true },
        },
      },
    });

    // Log action
    console.log(
      `[ADMIN-PRODUCTS] Product ${productId} (${product.name}) status changed to ${status} by admin ${admin.id}`
    );

    return NextResponse.json({
      success: true,
      message: `Product ${status === "ACTIVE" ? "approved" : "rejected"}`,
      product,
    });
  } catch (error) {
    console.error("[ADMIN-PRODUCTS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
