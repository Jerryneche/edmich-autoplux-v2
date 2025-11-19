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

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: { supplierId: supplierProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPPLIER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, description, price, category, brand, stock, image, images } =
      body;

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        category,
        brand,
        stock: parseInt(stock),
        image,
        images: images || [],
        status: "ACTIVE",
        supplierId: supplierProfile.id,
      },
    });

    // 🔥 NOTIFY SUPPLIER ABOUT NEW PRODUCT
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "PRODUCT_CREATED",
        title: "Product Listed Successfully",
        message: `Your product "${name}" has been added to the marketplace. ${
          stock < 5 ? "⚠️ Stock is low, consider restocking." : ""
        }`,
        link: `/dashboard/supplier`,
      },
    });

    // 🔥 CHECK IF STOCK IS LOW IMMEDIATELY
    if (stock < 5) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "LOW_INVENTORY",
          title: "Low Stock Alert",
          message: `${name} was added with only ${stock} units. Consider increasing stock for better sales.`,
          link: `/dashboard/supplier/products/${product.id}/edit`,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
