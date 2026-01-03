// app/api/supplier/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Get all products for the supplier
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

    const products = await prisma.product.findMany({
      where: {
        supplierId: supplierProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: {
          select: {
            businessName: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Supplier products GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, price, category, stock, imageUrl, brand } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || "",
        price: parseFloat(price),
        category,
        brand: brand || null,
        stock: parseInt(stock) || 0,
        image: imageUrl || null,
        status: "ACTIVE",
        supplierId: supplierProfile.id,
      },
      include: {
        supplier: {
          select: {
            businessName: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Supplier products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
