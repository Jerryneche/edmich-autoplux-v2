import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Fetch supplier's products
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find supplier profile
    const supplierProfile =
      user.supplierProfile ||
      (await prisma.supplierProfile.findUnique({
        where: { userId: user.id },
      }));

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Fetch all products for this supplier
    const products = await prisma.product.findMany({
      where: { supplierId: supplierProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has supplier profile
    const supplierProfile =
      user.supplierProfile ||
      (await prisma.supplierProfile.findUnique({
        where: { userId: user.id },
      }));

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    if (!supplierProfile.verified || !supplierProfile.approved) {
      return NextResponse.json(
        { error: "Supplier account not approved yet" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, price, category, stock, imageUrl } = body;

    // Validate required fields
    if (!name || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price and stock are numbers
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: "Invalid stock quantity" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: priceNum,
        category,
        stock: stockNum,
        image: imageUrl || null,
        supplierId: supplierProfile.id,
        status: "ACTIVE",
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
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
