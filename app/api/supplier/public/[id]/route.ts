// app/api/suppliers/public/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch supplier with all necessary data
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        products: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            image: true,
            images: true,
            stock: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Only show verified suppliers publicly
    if (!supplier.verified) {
      return NextResponse.json(
        { error: "Supplier not verified" },
        { status: 403 }
      );
    }

    // Calculate stats
    const totalProducts = supplier.products.length;
    const inStockProducts = supplier.products.filter((p) => p.stock > 0).length;
    const categories = [...new Set(supplier.products.map((p) => p.category))];

    // Get orders stats (if you want to show completed orders)
    const completedOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              supplierId: supplier.id,
            },
          },
        },
        status: "DELIVERED",
      },
    });

    // Get average rating (if you have reviews)
    const reviews = await prisma.review.findMany({
      where: {
        product: {
          supplierId: supplier.id,
        },
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      supplier: {
        id: supplier.id,
        businessName: supplier.businessName,
        description: supplier.description,
        city: supplier.city,
        state: supplier.state,
        verified: supplier.verified,
        createdAt: supplier.createdAt,
        tagline: supplier.tagline,
        website: supplier.website,
        instagram: supplier.instagram,
        facebook: supplier.facebook,
        twitter: supplier.twitter,
        whatsapp: supplier.whatsapp,
        tiktok: supplier.tiktok,
        businessHours: supplier.businessHours,
        coverImage: supplier.coverImage,
        logo: supplier.logo,
      },
      contact: {
        name: supplier.user.name,
        email: supplier.user.email,
        phone: supplier.user.phone,
        image: supplier.user.image,
      },
      products: supplier.products,
      stats: {
        totalProducts,
        inStockProducts,
        categories: categories.length,
        completedOrders,
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}
