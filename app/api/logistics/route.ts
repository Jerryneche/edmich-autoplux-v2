import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const verified = searchParams.get("verified");
    const available = searchParams.get("available");
    const limit = searchParams.get("limit");

    const where: any = {
      approved: true,
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state;
    }

    if (verified === "true") {
      where.verified = true;
    }

    if (available === "true") {
      where.available = true;
    }

    const providers = await prisma.logisticsProfile.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
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
