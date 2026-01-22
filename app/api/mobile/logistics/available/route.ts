import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mobile/logistics/available
 * Get list of available logistics providers for assignment
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceArea = searchParams.get("serviceArea");
    const vehicleType = searchParams.get("vehicleType");
    const rating = searchParams.get("rating");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const where: any = {
      isAvailable: true,
      verified: true,
    };

    if (serviceArea) {
      where.coverageAreas = {
        has: serviceArea,
      };
    }

    if (vehicleType) {
      where.vehicleTypes = {
        has: vehicleType,
      };
    }

    if (rating) {
      where.rating = {
        gte: parseFloat(rating),
      };
    }

    // Get providers
    const providers = await prisma.logisticsProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: { in: ["PENDING", "ACCEPTED"] },
          },
        },
      },
      take: limit,
      skip,
    });

    const total = await prisma.logisticsProfile.count({ where });

    const formatted = providers.map((provider) => ({
      id: provider.id,
      name: provider.user.name,
      phone: provider.phone,
      email: provider.user.email,
      rating: provider.rating,
      completedDeliveries: provider.completedDeliveries,
      vehicle: provider.vehicleType,
      availableSlots: Math.max(0, 10 - provider.bookings.length), // Assume max 10 deliveries
      coverageAreas: provider.coverageAreas,
    }));

    return NextResponse.json({
      success: true,
      total,
      providers: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching available logistics providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
