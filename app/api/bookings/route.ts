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

  // Required fields
  if (!mechanicId || !service || !appointmentDate || !carModel) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: mechanicId, service, appointmentDate, carModel",
      },
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

// GET: Fetch All Bookings (Admin / Mechanic View)
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
            businessName: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
