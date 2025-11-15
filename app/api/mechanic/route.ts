import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all mechanics (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const specialization = searchParams.get("specialization");
    const verified = searchParams.get("verified");

    const where: any = {
      approved: true,
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state;
    }

    if (specialization) {
      where.specialization = {
        has: specialization,
      };
    }

    if (verified === "true") {
      where.verified = true;
    }

    const mechanics = await prisma.mechanicProfile.findMany({
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

    return NextResponse.json(mechanics);
  } catch (error: any) {
    console.error("Error fetching mechanics:", error);
    return NextResponse.json(
      { error: "Failed to fetch mechanics" },
      { status: 500 }
    );
  }
}
