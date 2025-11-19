// app/api/bookings/mechanics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface MechanicBookingBody {
  mechanicId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number | string;
  plateNumber?: string;
  serviceType: string;
  customService?: string;
  estimatedPrice: number | string;
  date: string;
  time: string;
  location?: string;
  address: string;
  city: string;
  state?: string;
  phone: string;
  additionalNotes?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: MechanicBookingBody = await request.json();

    const {
      mechanicId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      plateNumber,
      serviceType,
      customService,
      estimatedPrice,
      date,
      time,
      location,
      address,
      city,
      state,
      phone,
      additionalNotes,
    } = body;

    // Required fields
    const required = [
      mechanicId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      serviceType,
      date,
      time,
      address,
      city,
      phone,
      estimatedPrice,
    ];

    if (required.some((f) => f === undefined || f === null || f === "")) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const price = parseFloat(estimatedPrice as string);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid estimated price" },
        { status: 400 }
      );
    }

    // Convert vehicleYear to String
    const yearStr = String(vehicleYear).trim();
    if (!/^\d{4}$/.test(yearStr)) {
      return NextResponse.json(
        { error: "Vehicle year must be a 4-digit number" },
        { status: 400 }
      );
    }

    // Get mechanic profile to find userId
    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { id: mechanicId },
      select: { userId: true, businessName: true },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 }
      );
    }

    // Get buyer's name
    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const booking = await prisma.mechanicBooking.create({
      data: {
        userId: session.user.id,
        mechanicId,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleYear: yearStr,
        plateNumber: plateNumber?.trim() || null,
        serviceType: serviceType.trim(),
        customService: customService?.trim() || null,
        estimatedPrice: price,
        date: date.trim(),
        time: time.trim(),
        location: location?.trim() || "WORKSHOP",
        address: address.trim(),
        city: city.trim(),
        state: state?.trim() || null,
        phone: phone.trim(),
        additionalNotes: additionalNotes?.trim() || null,
        status: "PENDING",
      },
    });

    // 🔥 NOTIFY BUYER - Booking Confirmation
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "BOOKING",
        title: "Service Booking Confirmed",
        message: `Your ${serviceType} service booking for ${vehicleMake} ${vehicleModel} has been created. Scheduled for ${date} at ${time}. The mechanic will confirm shortly.`,
        link: `/dashboard/buyer/bookings?type=mechanics`,
        read: false,
      },
    });

    // 🔥 NOTIFY MECHANIC - New Booking
    await prisma.notification.create({
      data: {
        userId: mechanicProfile.userId,
        type: "BOOKING",
        title: "New Service Booking",
        message: `New ${serviceType} booking from ${
          buyer?.name || "Customer"
        } for ${vehicleMake} ${vehicleModel}. Scheduled: ${date} at ${time}. Location: ${city}, ${
          state || "Nigeria"
        }`,
        link: `/dashboard/mechanic/bookings/${booking.id}`,
        read: false,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating mechanic booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET - User or Mechanic view
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    let bookings;

    if (view === "mechanic") {
      const profile = await prisma.mechanicProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Mechanic profile not found" },
          { status: 404 }
        );
      }

      bookings = await prisma.mechanicBooking.findMany({
        where: { mechanicId: profile.id },
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (view === "customer") {
      bookings = await prisma.mechanicBooking.findMany({
        where: { userId: session.user.id },
        include: {
          mechanic: {
            select: {
              businessName: true,
              phone: true,
              city: true,
              state: true,
              specialization: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.mechanicBooking.findMany({
        where: { userId: session.user.id },
        include: {
          mechanic: {
            select: {
              businessName: true,
              phone: true,
              city: true,
              state: true,
              specialization: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching mechanic bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
