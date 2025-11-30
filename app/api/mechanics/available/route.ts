import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("lat") || "0");
    const longitude = parseFloat(searchParams.get("lng") || "0");
    const serviceType = searchParams.get("serviceType");
    const radius = parseFloat(searchParams.get("radius") || "10"); // km

    // Find mechanics within radius
    const mechanics = await prisma.mechanic.findMany({
      where: {
        isAvailable: true,
        verified: true,
        ...(serviceType && {
          specializations: {
            has: serviceType,
          },
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        bookings: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          select: {
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    // Calculate distance and filter by radius
    const mechanicsWithDistance = mechanics
      .map((mechanic) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          mechanic.latitude || 0,
          mechanic.longitude || 0
        );

        const averageRating =
          mechanic.reviews.length > 0
            ? mechanic.reviews.reduce((acc, r) => acc + r.rating, 0) /
              mechanic.reviews.length
            : 0;

        return {
          ...mechanic,
          distance,
          averageRating,
          reviewCount: mechanic.reviews.length,
        };
      })
      .filter((m) => m.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      mechanics: mechanicsWithDistance,
    });
  } catch (error) {
    console.error("Mechanics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mechanics" },
      { status: 500 }
    );
  }
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
