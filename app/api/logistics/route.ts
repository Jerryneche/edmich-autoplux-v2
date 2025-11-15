import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all logistics providers (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const vehicleType = searchParams.get("vehicleType");
    const verified = searchParams.get("verified");
    const available = searchParams.get("available");

    const where: any = {
      approved: true,
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state;
    }

    if (vehicleType) {
      where.vehicleTypes = {
        has: vehicleType,
      };
    }

    if (verified === "true") {
      where.verified = true;
    }

    if (available === "true") {
      where.available = true;
    }

    const providers = await prisma.logisticsProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    });

    return NextResponse.json(providers);
  } catch (error: any) {
    console.error("Error fetching logistics providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch logistics providers" },
      { status: 500 }
    );
  }
}
