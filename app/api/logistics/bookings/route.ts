// app/api/logistics/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Haversine distance (km) - used internally for calculations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.logisticsBooking.findMany({
      where: { userId: session.user.id },
      include: {
        driver: {
          // ← Correct relation name
          select: {
            companyName: true,
            phone: true,
            vehicleType: true,
            rating: true,
            vehicleNumber: true,
          },
        },
        user: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("Error fetching logistics bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      driverId, // ← this is the LogisticsProfile.id, not userId
      pickupAddress,
      pickupCity,
      pickupState,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      packageType,
      deliverySpeed,
      packageDescription,
      packageValue,
      recipientName,
      recipientPhone,
      specialInstructions,
      phone,
    } = data;

    // Validate required fields
    if (!driverId || !pickupAddress || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch driver to validate existence and availability
    const driver = await prisma.logisticsProfile.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        isAvailable: true,
        approved: true,
        verified: true,
      },
    });

    if (
      !driver ||
      !driver.isAvailable ||
      !driver.approved ||
      !driver.verified
    ) {
      return NextResponse.json(
        { error: "Driver not available or not approved" },
        { status: 400 }
      );
    }

    // Dummy price calculation (you can make this dynamic later)
    const estimatedPrice = 5000 + Math.random() * 10000; // placeholder

    const booking = await prisma.logisticsBooking.create({
      data: {
        userId: session.user.id,
        driverId: driverId, // ← correct field
        packageType,
        deliverySpeed: deliverySpeed || "standard",
        packageDescription,
        packageValue: packageValue ? parseFloat(packageValue) : null,
        estimatedPrice,

        pickupAddress,
        pickupCity,
        pickupState,

        deliveryAddress,
        deliveryCity,
        deliveryState,

        phone,
        recipientName,
        recipientPhone,
        specialInstructions,

        status: "PENDING", // ← Correct enum case
      },
      include: {
        driver: {
          select: {
            companyName: true,
            phone: true,
            vehicleType: true,
            rating: true,
            vehicleNumber: true,
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Notify the logistics driver
    await prisma.notification.create({
      data: {
        userId: (await prisma.logisticsProfile.findUnique({
          where: { id: driverId },
          select: { userId: true },
        }))!.userId,
        title: "New Delivery Request",
        message: `You have a new delivery request from ${
          session.user.name || "a customer"
        }`,
        type: "DELIVERY", // ← Correct enum value
        link: `/dashboard/logistics/bookings/${booking.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error: unknown) {
    console.error("Logistics booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
