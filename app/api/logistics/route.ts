// app/api/logistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - List logistics providers (public or filtered)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const available = searchParams.get("available");

    const where: any = {
      approved: true,
    };

    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (available === "true") where.isAvailable = true;

    const providers = await prisma.logisticsProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { completedDeliveries: "desc" }],
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
