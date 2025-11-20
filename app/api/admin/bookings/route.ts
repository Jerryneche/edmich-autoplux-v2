import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch REAL mechanic bookings
    const mechanicBookings = await prisma.mechanicBooking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        mechanic: {
          select: {
            businessName: true,
            phone: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch REAL logistics bookings
    const logisticsBookings = await prisma.logisticsBooking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        driver: {
          select: {
            companyName: true,
            phone: true,
            vehicleType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Combine and format bookings
    const allBookings = [
      ...mechanicBookings.map((booking) => ({
        id: booking.id,
        carModel: `${booking.vehicleMake} ${booking.vehicleModel} (${booking.vehicleYear})`,
        service: booking.serviceType,
        status: booking.status,
        appointmentDate: `${booking.date} ${booking.time}`,
        user: booking.user,
        mechanic: booking.mechanic,
        type: "MECHANIC" as const,
        createdAt: booking.createdAt,
      })),
      ...logisticsBookings.map((booking) => ({
        id: booking.id,
        carModel: booking.packageType, // Using as description
        service: `${booking.pickupCity} → ${booking.deliveryCity}`,
        status: booking.status,
        appointmentDate: booking.createdAt.toISOString(),
        user: booking.user,
        driver: booking.driver,
        type: "LOGISTICS" as const,
        createdAt: booking.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
