// app/api/logistics/providers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Haversine formula – returns distance in KM (rounded to 2 decimals)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (num: number) => (num * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const l1 = toRad(lat1);
  const l2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(l1) * Math.cos(l2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let latitude = parseFloat(searchParams.get("lat") || "0");
    let longitude = parseFloat(searchParams.get("lng") || "0");
    const vehicleType = searchParams.get("vehicleType");
    const orderId = searchParams.get("orderId");

    // If orderId is provided, fetch the order's shipping address coordinates
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { shippingAddress: true },
      });

      if (order?.shippingAddress) {
        latitude = order.shippingAddress.latitude || latitude;
        longitude = order.shippingAddress.longitude || longitude;
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const providers = await prisma.logisticsProfile.findMany({
      where: {
        isAvailable: true,
        verified: true,
        approved: true,
        ...(vehicleType && {
          vehicleTypes: { has: vehicleType },
        }),
        currentLat: { not: null },
        currentLng: { not: null },
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

    const providersWithDetails = providers
      .map((provider) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          provider.currentLat!,
          provider.currentLng!
        );

        const reviewCount = provider.reviews.length;
        const averageRating =
          reviewCount > 0
            ? Number(
                (
                  provider.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  reviewCount
                ).toFixed(2)
              )
            : 0;

        return {
          id: provider.id,
          companyName: provider.companyName,
          vehicleType: provider.vehicleType,
          vehicleNumber: provider.vehicleNumber,
          phone: provider.phone,
          description: provider.description,
          rating: provider.rating, // your built-in aggregate rating
          completedDeliveries: provider.completedDeliveries,
          currentLat: provider.currentLat,
          currentLng: provider.currentLng,
          isAvailable: provider.isAvailable,
          coverageAreas: provider.coverageAreas,
          vehicleTypes: provider.vehicleTypes,
          user: provider.user,

          // Calculated fields
          distance,
          averageRating, // from actual reviews
          reviewCount,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // optional: limit results

    return NextResponse.json({
      success: true,
      count: providersWithDetails.length,
      providers: providersWithDetails,
    });
  } catch (error: any) {
    console.error("Error fetching logistics providers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
