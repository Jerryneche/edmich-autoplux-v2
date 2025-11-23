// app/api/bookings/logistics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      providerId,
      packageType,
      deliverySpeed,
      packageDescription,
      weight,
      pickupAddress,
      pickupCity,
      deliveryAddress,
      deliveryCity,
      recipientName,
      recipientPhone,
      specialInstructions,
      estimatedPrice,
    } = body;

    // Validate required fields
    if (
      !providerId ||
      !packageType ||
      !weight ||
      !pickupAddress ||
      !deliveryAddress ||
      !recipientName ||
      !recipientPhone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate provider exists
    const provider = await prisma.logisticsProfile.findUnique({
      where: { id: providerId },
      select: { userId: true, companyName: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

    // Get buyer's name
    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}`;

    // Create booking
    const booking = await prisma.logisticsBooking.create({
      data: {
        userId: session.user.id,
        driverId: providerId,
        packageType,
        deliverySpeed,
        packageDescription,
        pickupAddress,
        pickupCity,
        deliveryAddress,
        deliveryCity,
        recipientName,
        recipientPhone,
        phone: session.user.email || recipientPhone,
        specialInstructions: specialInstructions || null,
        estimatedPrice: parseFloat(estimatedPrice),
        status: "PENDING",
        trackingNumber,
      },
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
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "BOOKING",
        title: "Delivery Booking Confirmed",
        message: `Your ${packageType} delivery from ${pickupCity} to ${deliveryCity} has been booked. Tracking: ${trackingNumber}`,
        link: `/dashboard/buyer/bookings?type=logistics`,
      },
    });

    // Notify logistics provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: "BOOKING",
        title: "New Delivery Request",
        message: `New ${packageType} delivery request from ${
          buyer?.name || "Customer"
        }. Route: ${pickupCity} → ${deliveryCity}`,
        link: `/dashboard/logistics/bookings`,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET - Fetch bookings based on view
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    let bookings;

    if (view === "provider" || view === "driver") {
      // For logistics providers - find their profile first
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
          user: {
            select: { name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (view === "customer") {
      // For customers viewing their own bookings
      bookings = await prisma.logisticsBooking.findMany({
        where: { userId: session.user.id },
        include: {
          driver: {
            select: {
              companyName: true,
              phone: true,
              vehicleType: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Default to customer view
      bookings = await prisma.logisticsBooking.findMany({
        where: { userId: session.user.id },
        include: {
          driver: {
            select: {
              companyName: true,
              phone: true,
              vehicleType: true,
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
