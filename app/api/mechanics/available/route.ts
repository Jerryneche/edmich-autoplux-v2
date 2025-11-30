// app/api/mechanics/available/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Proper Haversine distance
const toRad = (value: number) => (value * Math.PI) / 180;

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("lat") || "0");
    const longitude = parseFloat(searchParams.get("lng") || "0");
    const serviceType = searchParams.get("serviceType");
    const radius = parseFloat(searchParams.get("radius") || "20");

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Location required" }, { status: 400 });
    }

    const mechanics = await prisma.mechanicProfile.findMany({
      where: {
        isAvailable: true,
        approved: true,
        verified: true,
        latitude: { not: null },
        longitude: { not: null },
        // Fix: specialization is String[] → use "has"
        ...(serviceType && {
          specialization: {
            has: serviceType,
          },
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            image: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const result = mechanics
      .map((mechanic) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          mechanic.latitude!,
          mechanic.longitude!
        );

        const ratings = mechanic.reviews.map((r) => r.rating);
        const averageRating =
          ratings.length > 0
            ? Number(
                (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
              )
            : 0;

        return {
          id: mechanic.id,
          name: mechanic.user.name,
          phone: mechanic.user.phone,
          image: mechanic.user.image,
          specialty: mechanic.specialty,
          specializations: mechanic.specialization,
          location: mechanic.location,
          hourlyRate: mechanic.hourlyRate,
          rating: mechanic.rating,
          completedJobs: mechanic.completedJobs,
          isAvailable: mechanic.isAvailable,
          distance,
          averageRating,
          reviewCount: ratings.length,
        };
      })
      .filter((m) => m.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      mechanics: result,
      count: result.length,
    });
  } catch (error: any) {
    console.error("Mechanics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mechanics" },
      { status: 500 }
    );
  }
}
