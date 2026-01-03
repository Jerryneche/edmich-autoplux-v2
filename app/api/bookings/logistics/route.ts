// app/api/bookings/logistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

interface LogisticsBookingBody {
  providerId: string;
  packageType: string;
  deliverySpeed: string;
  packageDescription?: string;
  weight?: number;
  pickupAddress: string;
  pickupCity: string;
  pickupState?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState?: string;
  phone: string;
  recipientName: string;
  recipientPhone: string;
  specialInstructions?: string;
  estimatedPrice: number;
}

function generateTrackingNumber(): string {
  const prefix = "EDM";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: LogisticsBookingBody = await request.json();

    const {
      providerId,
      packageType,
      deliverySpeed,
      packageDescription,
      weight,
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
      estimatedPrice,
    } = body;

    // Required fields validation
    const required = [
      providerId,
      packageType,
      deliverySpeed,
      pickupAddress,
      pickupCity,
      deliveryAddress,
      deliveryCity,
      phone,
      recipientName,
      recipientPhone,
      estimatedPrice,
    ];

    if (required.some((f) => f === undefined || f === null || f === "")) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const price = parseFloat(estimatedPrice as any);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid estimated price" },
        { status: 400 }
      );
    }

    // Get logistics provider for notifications
    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { id: providerId },
      select: { userId: true, companyName: true },
    });

    if (!logisticsProfile) {
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

    const trackingNumber = generateTrackingNumber();

    const booking = await prisma.logisticsBooking.create({
      data: {
        userId: user.id,
        providerId,
        packageType,
        deliverySpeed,
        packageDescription: packageDescription || null,
        weight: weight ? parseFloat(weight as any) : null,
        pickupAddress,
        pickupCity,
        pickupState: pickupState || null,
        deliveryAddress,
        deliveryCity,
        deliveryState: deliveryState || null,
        phone,
        recipientName,
        recipientPhone,
        specialInstructions: specialInstructions || null,
        estimatedPrice: price,
        trackingNumber,
        status: "PENDING",
        currentLocation: pickupCity,
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

    // ✅ Notify the BUYER (user who booked)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "BOOKING",
        title: "Delivery Booked Successfully",
        message: `Your ${packageType} delivery from ${pickupCity} to ${deliveryCity} has been booked. Tracking: ${trackingNumber}`,
        link: `/bookings/logistics/${booking.id}`,
      },
    });

    // ✅ Notify the LOGISTICS PROVIDER
    await prisma.notification.create({
      data: {
        userId: logisticsProfile.userId,
        type: "BOOKING",
        title: "New Delivery Request!",
        message: `${
          user.name || "A customer"
        } booked ${packageType} delivery from ${pickupCity} to ${deliveryCity}`,
        link: `/dashboard/logistics/bookings`,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating logistics booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET - User or Provider view
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    let bookings;

    if (view === "provider") {
      // Logistics provider viewing their received bookings
      const profile = await prisma.logisticsProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Logistics profile not found" },
          { status: 404 }
        );
      }

      bookings = await prisma.logisticsBooking.findMany({
        where: { providerId: profile.id },
        include: {
          user: {
            select: { name: true, email: true, image: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Buyer viewing their bookings (default)
      bookings = await prisma.logisticsBooking.findMany({
        where: { userId: user.id },
        include: {
          driver: {
            select: {
              companyName: true,
              phone: true,
              city: true,
              state: true,
              vehicleTypes: true,
              user: {
                select: { name: true, image: true },
              },
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
