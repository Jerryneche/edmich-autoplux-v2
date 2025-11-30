// app/api/mechanics/available/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const verifiedOnly = searchParams.get("verified") === "true";

    const mechanics = await prisma.mechanicProfile.findMany({
      where: {
        isAvailable: true,
        approved: true,
        ...(verifiedOnly && { verified: true }),
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(state && { state: { contains: state, mode: "insensitive" } }),
        ...(serviceType && {
          specialization: { has: serviceType },
        }),
      },
      include: {
        user: {
          select: { name: true, phone: true, image: true },
        },
        reviews: { select: { rating: true } },
      },
      orderBy: { rating: "desc" },
      take: 100,
    });

    const result = mechanics.map((m) => {
      const avgRating =
        m.reviews.length > 0
          ? Number(
              (
                m.reviews.reduce((a, r) => a + r.rating, 0) / m.reviews.length
              ).toFixed(1)
            )
          : 0;

      return {
        id: m.id,
        businessName: m.businessName,
        city: m.city,
        state: m.state,
        specialty: m.specialty,
        specialization: m.specialization,
        experience: m.experience,
        hourlyRate: m.hourlyRate,
        rating: m.rating,
        completedJobs: m.completedJobs,
        verified: m.verified,
        isAvailable: m.isAvailable,
        user: m.user,
        averageRating: avgRating,
        reviewCount: m.reviews.length,
      };
    });

    return NextResponse.json({
      success: true,
      mechanics: result,
      count: result.length,
    });
  } catch (error: any) {
    console.error("Mechanics API error:", error);
    return NextResponse.json(
      { error: "Failed to load mechanics" },
      { status: 500 }
    );
  }
}
