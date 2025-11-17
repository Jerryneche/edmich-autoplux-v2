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
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

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
        trackingNumber: `TRK-${Date.now().toString(36).toUpperCase()}`,
      },
      include: {
        driver: {
          select: { companyName: true, phone: true },
        },
      },
    });

    // Send notification to provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: "BOOKING",
        title: "New Delivery Request",
        message: `New booking from ${session.user.name || "Customer"}`,
        link: `/dashboard/provider/bookings/logistics/${booking.id}`,
        read: false,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
