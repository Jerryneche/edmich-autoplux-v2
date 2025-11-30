// app/api/mechanics/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "mechanic" or "buyer"

    // Find MechanicProfile to get actual ID
    const mechanicProfile =
      role === "mechanic"
        ? await prisma.mechanicProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          })
        : null;

    const where =
      role === "mechanic"
        ? { mechanicId: mechanicProfile?.id }
        : { userId: session.user.id };

    const bookings = await prisma.mechanicBooking.findMany({
      where,
      include: {
        user: {
          select: { name: true, image: true, phone: true },
        },
        mechanic: {
          include: {
            user: {
              select: { name: true, image: true, phone: true },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
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
      mechanicId, // This is MechanicProfile.id
      vehicleMake,
      vehicleModel,
      vehicleYear,
      plateNumber,
      serviceType,
      customService,
      date,
      time,
      location,
      address,
      city,
      state,
      endTime,
      phone,
      additionalNotes,
    } = data;

    if (!mechanicId || !serviceType || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const existing = await prisma.mechanicBooking.findFirst({
      where: {
        mechanicId,
        date,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { startTime: { lte: time }, endTime: { gt: time } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: time }, endTime: { lte: endTime } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Mechanic is not available at this time" },
        { status: 400 }
      );
    }

    const mechanic = await prisma.mechanicProfile.findUnique({
      where: { id: mechanicId },
      select: { hourlyRate: true, userId: true },
    });

    if (!mechanic) {
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 }
      );
    }

    const booking = await prisma.mechanicBooking.create({
      data: {
        userId: session.user.id,
        mechanicId,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        plateNumber,
        serviceType,
        customService,
        date,
        time,
        location,
        address,
        city,
        state,
        phone,
        additionalNotes,
        estimatedPrice: mechanic.hourlyRate * 2, // example
        status: "PENDING", // ← Correct enum
      },
      include: {
        mechanic: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    // Notify mechanic
    await prisma.notification.create({
      data: {
        userId: mechanic.userId,
        title: "New Service Request",
        message: `New booking from ${session.user.name || "a customer"}`,
        type: "BOOKING", // ← Correct enum
        link: `/mechanic/bookings/${booking.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking request sent!",
      booking,
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}
