import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleType = searchParams.get("vehicleType");
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    const providers = await prisma.logisticsProfile.findMany({
      where: {
        isAvailable: true,
        verified: true,
        approved: true,
        ...(vehicleType && {
          vehicleTypes: { has: vehicleType },
        }),
        ...(city && {
          OR: [
            { city: { contains: city, mode: "insensitive" } },
            { coverageAreas: { has: city } },
          ],
        }),
        ...(state && {
          OR: [
            { state: { contains: state, mode: "insensitive" } },
            { coverageAreas: { has: state } },
          ],
        }),
      },
      include: {
        user: {
          select: { name: true, phone: true, image: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const providersWithDetails = providers.map((provider) => {
      const reviewCount = provider.reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number(
              (
                provider.reviews.reduce((sum, r) => sum + r.rating, 0) /
                reviewCount
              ).toFixed(2),
            )
          : 0;

      return {
        id: provider.id,
        companyName: provider.companyName,
        vehicleType: provider.vehicleType,
        vehicleNumber: provider.vehicleNumber,
        phone: provider.phone,
        description: provider.description,
        rating: provider.rating,
        completedDeliveries: provider.completedDeliveries,
        currentLat: provider.currentLat,
        currentLng: provider.currentLng,
        isAvailable: provider.isAvailable,
        coverageAreas: provider.coverageAreas,
        vehicleTypes: provider.vehicleTypes,
        city: provider.city,
        state: provider.state,
        address: provider.address,
        user: provider.user,
        averageRating,
        reviewCount,
      };
    })
    .sort((a, b) => b.rating - a.rating || b.completedDeliveries - a.completedDeliveries);

    return NextResponse.json({
      success: true,
      count: providersWithDetails.length,
      providers: providersWithDetails,
    });
  } catch (error: any) {
    console.error("Error fetching logistics providers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
