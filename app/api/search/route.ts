// app/api/products/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, boolean | object> = {
      status: "ACTIVE", // your schema uses "ACTIVE"
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: "desc" };
    switch (sort) {
      case "price_low":
        orderBy = { price: "asc" };
        break;
      case "price_high":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      orderBy,
      take: 50,
      include: {
        supplier: {
          select: {
            businessName: true,
            logo: true,
            verified: true,
            // No rating on SupplierProfile → we'll calculate from reviews later if needed
          },
        },
        reviews: {
          // This is your Review model with productId
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating safely
    const productsWithRating = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? Number(
              (
                ratings.reduce((acc: number, r: number) => acc + r, 0) /
                ratings.length
              ).toFixed(1)
            )
          : 0;

      return {
        ...product,
        averageRating,
        reviewCount: ratings.length,
        // Clean supplier data
        supplier: {
          name: product.supplier.businessName,
          logo: product.supplier.logo,
          verified: product.supplier.verified,
        },
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      count: productsWithRating.length,
    });
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}

// Voice search placeholder
export async function POST(request: Request) {
  try {
    const { audioData: _audioData } = await request.json();
    // TODO: Integrate with Whisper API or similar
    const transcription = "brake pads for Toyota Camry";

    return NextResponse.json({
      success: true,
      transcription,
      suggestion: "Searching for: " + transcription,
    });
  } catch (error: unknown) {
    console.error("Voice search error:", error);
    return NextResponse.json({ error: "Voice search failed" }, { status: 500 });
  }
}
