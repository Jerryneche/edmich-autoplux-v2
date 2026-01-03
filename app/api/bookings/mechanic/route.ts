// app/api/bookings/mechanic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
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

    // Convert vehicleYear to String (Prisma expects String)
    const yearStr = String(vehicleYear).trim();
    if (!/^\d{4}$/.test(yearStr)) {
      return NextResponse.json(
        { error: "Vehicle year must be a 4-digit number" },
        { status: 400 }
      );
    }

    // Get mechanic profile for notifications
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

    const booking = await prisma.mechanicBooking.create({
      data: {
        userId: user.id,
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
      include: {
        mechanic: {
          select: {
            businessName: true,
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
        title: "Booking Confirmed",
        message: `Your ${serviceType} service with ${mechanicProfile.businessName} on ${date} at ${time} has been booked successfully.`,
        link: `/bookings/mechanic/${booking.id}`,
      },
    });

    // ✅ Notify the MECHANIC
    await prisma.notification.create({
      data: {
        userId: mechanicProfile.userId,
        type: "BOOKING",
        title: "New Service Booking!",
        message: `${
          user.name || "A customer"
        } booked ${serviceType} for ${vehicleMake} ${vehicleModel} (${vehicleYear}) on ${date} at ${time}`,
        link: `/dashboard/mechanic/bookings`,
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
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    let bookings;

    if (view === "mechanic") {
      // Mechanic viewing their received bookings
      const profile = await prisma.mechanicProfile.findUnique({
        where: { userId: user.id },
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
            select: { name: true, email: true, image: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Buyer viewing their bookings (default)
      bookings = await prisma.mechanicBooking.findMany({
        where: { userId: user.id },
        include: {
          mechanic: {
            select: {
              businessName: true,
              phone: true,
              city: true,
              state: true,
              specialization: true,
              rating: true,
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
    console.error("Error fetching mechanic bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
