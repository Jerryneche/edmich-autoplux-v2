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

    const where: any =
      role === "mechanic"
        ? { mechanicId: session.user.id }
        : { buyerId: session.user.id };

    const bookings = await prisma.mechanicBooking.findMany({
      where,
      include: {
        mechanic: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                phone: true,
              },
            },
          },
        },
        buyer: {
          select: {
            name: true,
            image: true,
            phone: true,
          },
        },
        vehicle: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
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
      mechanicId,
      vehicleId,
      serviceType,
      date,
      startTime,
      endTime,
      description,
      location,
      latitude,
      longitude,
    } = data;

    // Check mechanic availability
    const existingBooking = await prisma.mechanicBooking.findFirst({
      where: {
        mechanicId,
        date: new Date(date),
        status: { in: ["pending", "confirmed"] },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Mechanic not available at this time" },
        { status: 400 }
      );
    }

    // Get mechanic pricing
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: mechanicId },
    });

    const booking = await prisma.mechanicBooking.create({
      data: {
        buyerId: session.user.id,
        mechanicId,
        vehicleId,
        serviceType,
        date: new Date(date),
        startTime,
        endTime,
        description,
        location,
        latitude,
        longitude,
        estimatedPrice: mechanic?.basePrice || 0,
        status: "pending",
      },
      include: {
        mechanic: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Notify mechanic
    await prisma.notification.create({
      data: {
        userId: mechanicId,
        title: "New Booking Request",
        message: `You have a new booking request for ${serviceType}`,
        type: "booking",
        actionUrl: `/mechanic/bookings/${booking.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
