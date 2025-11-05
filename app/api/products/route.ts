import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    // Filter by category if provided
    if (category && category !== "All") {
      where.category = category;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform data to include supplier name
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      supplierId: product.supplierId,
      supplier:
        product.supplier.businessName ||
        product.supplier.user?.name ||
        "Verified Supplier",
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
