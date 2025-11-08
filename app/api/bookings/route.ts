// app/api/bookings/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Create Booking
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const {
    mechanicId,
    service,
    appointmentDate,
    carModel,
    notes,
    name,
    email,
    phone,
  } = data;

  if (!mechanicId || !service || !appointmentDate || !carModel) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        mechanicId,
        service,
        appointmentDate: new Date(appointmentDate),
        carModel,
        notes: notes || null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Booking create error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET: Fetch All Bookings with Mechanic Name from User
// app/api/bookings/route.ts → GET
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            specialty: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform with null safety
    const transformed = bookings.map((booking) => ({
      ...booking,
      mechanic: booking.mechanic
        ? {
            id: booking.mechanic.id,
            specialty: booking.mechanic.specialty,
            name: booking.mechanic.user.name || "Unknown Mechanic",
          }
        : null,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
