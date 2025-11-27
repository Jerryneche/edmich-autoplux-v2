// app/api/suppliers/public/route.ts
// Get all verified suppliers (for directory/listing page)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// app/api/suppliers/public/route.ts
// Get all verified suppliers (for directory/listing page)
export async function GET() {
  try {
    const suppliers = await prisma.supplierProfile.findMany({
      where: {
        verified: true,
        approved: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        products: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = suppliers.map((s) => ({
      id: s.id,
      businessName: s.businessName,
      description: s.description,
      city: s.city,
      state: s.state,
      verified: s.verified,
      productCount: s.products.length,
      ownerName: s.user.name,
      ownerImage: s.user.image,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}
