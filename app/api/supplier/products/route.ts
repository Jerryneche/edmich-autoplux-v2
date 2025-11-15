import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

// GET - Fetch supplier's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can access this" },
        { status: 403 }
      );
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

    // Fetch products
    const products = await prisma.product.findMany({
      where: {
        supplierId: supplierProfile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can create products" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, stock, image } = body;

    // Validation
    if (!name || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        image,
        supplierId: supplierProfile.id,
      },
    });

    // Revalidate pages to show new product immediately
    try {
      revalidatePath("/shop");
      revalidatePath("/business/market");
      revalidatePath("/dashboard/supplier");
    } catch (revalidateError) {
      console.error("Revalidation error:", revalidateError);
      // Don't fail the request if revalidation fails
    }

    // Send notification to supplier
    await createNotification({
      userId: session.user.id,
      type: "PRODUCT",
      title: "Product Published",
      message: `${name} is now live in the marketplace!`,
      link: `/shop/${product.id}`,
    });

    // Check for low stock on creation
    if (parseInt(stock) <= 5 && parseInt(stock) > 0) {
      await createNotification({
        userId: session.user.id,
        type: "PRODUCT",
        title: "Low Stock Alert",
        message: `${name} has only ${stock} units in stock`,
        link: `/dashboard/supplier`,
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
