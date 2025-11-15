// app/api/bookings/logistics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // ... your existing POST code (unchanged, it's perfect)
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    let bookings;

    if (view === "provider") {
      // ← THIS IS CORRECT
      const profile = await prisma.logisticsProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Logistics profile not found" },
          { status: 404 }
        );
      }

      bookings = await prisma.logisticsBooking.findMany({
        where: { driverId: profile.id },
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.logisticsBooking.findMany({
        where: { userId: session.user.id },
        include: {
          driver: {
            select: {
              companyName: true,
              phone: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching logistics bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
