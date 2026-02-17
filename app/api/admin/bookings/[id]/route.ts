// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

// Helper: Add type discriminator
const withType = <T extends { id: string }>(
  booking: T,
  type: "MECHANIC" | "LOGISTICS",
): T & { type: "MECHANIC" | "LOGISTICS" } => {
  return { ...booking, type };
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try Mechanic Booking
    const mechanicBooking = await prisma.mechanicBooking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        mechanic: {
          select: { businessName: true, phone: true, city: true, state: true },
        },
      },
    });

    if (mechanicBooking) {
      return NextResponse.json(withType(mechanicBooking, "MECHANIC"));
    }

    // Try Logistics Booking
    const logisticsBooking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        driver: {
          select: { companyName: true, phone: true, city: true, state: true },
        },
      },
    });

    if (logisticsBooking) {
      return NextResponse.json(withType(logisticsBooking, "LOGISTICS"));
    }

    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, type } = body as {
      status: BookingStatus;
      type: "MECHANIC" | "LOGISTICS";
    };

    if (!status || !type) {
      return NextResponse.json(
        { error: "Status and type are required" },
        { status: 400 },
      );
    }

    let updatedBooking: Record<string, unknown> | undefined;

    if (type === "MECHANIC") {
      updatedBooking = await prisma.mechanicBooking.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { name: true, email: true } },
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
      updatedBooking = withType(updatedBooking as { id: string }, "MECHANIC");
    } else if (type === "LOGISTICS") {
      updatedBooking = await prisma.logisticsBooking.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { name: true, email: true } },
          driver: {
            select: { companyName: true, phone: true, city: true, state: true },
          },
        },
      });
      updatedBooking = withType(updatedBooking as { id: string }, "LOGISTICS");
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
