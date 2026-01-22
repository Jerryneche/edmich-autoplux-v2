import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mobile/mechanics/available
 * Get list of available mechanics for assignment
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const rating = searchParams.get("rating");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const where: any = {
      isAvailable: true,
      verified: true,
    };

    if (serviceType) {
      where.specialization = {
        has: serviceType,
      };
    }

    if (rating) {
      where.rating = {
        gte: parseFloat(rating),
      };
    }

    // Get mechanics
    const mechanics = await prisma.mechanicProfile.findMany({
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

    const total = await prisma.mechanicProfile.count({ where });

    const formatted = mechanics.map((mechanic) => ({
      id: mechanic.id,
      name: mechanic.user.name,
      phone: mechanic.user.phone,
      email: mechanic.user.email,
      rating: mechanic.rating,
      completedJobs: mechanic.completedJobs,
      availableSlots: Math.max(0, 5 - mechanic.bookings.length), // Assume max 5 bookings
      specializations: mechanic.specialization,
    }));

    return NextResponse.json({
      success: true,
      total,
      mechanics: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching available mechanics:", error);
    return NextResponse.json(
      { error: "Failed to fetch mechanics" },
      { status: 500 }
    );
  }
}
