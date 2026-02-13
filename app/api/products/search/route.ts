import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Search parameters
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "newest";
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const supplierName = searchParams.get("supplier");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build where clause
    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      where.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // Supplier filters
    if (city || state || supplierName) {
      where.supplier = {};
      if (city) {
        where.supplier.city = { contains: city, mode: "insensitive" };
      }
      if (state) {
        where.supplier.state = { contains: state, mode: "insensitive" };
      }
      if (supplierName) {
        where.supplier.businessName = {
          contains: supplierName,
          mode: "insensitive",
        };
      }
    }

    // Sorting
    let orderBy: any = {};
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "popular":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            userId: true,
            businessName: true,
            city: true,
            state: true,
            verified: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
