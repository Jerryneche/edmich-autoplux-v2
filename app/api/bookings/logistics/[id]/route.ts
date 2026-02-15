// app/api/bookings/logistics/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, phone: true, image: true },
        },
        driver: {
          select: {
            companyName: true,
            phone: true,
            city: true,
            state: true,
            vehicleType: true,
            vehicleNumber: true,
            rating: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, currentLocation } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get booking first
    const existingBooking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        driver: {
          select: { userId: true },
        },
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permission - must be the driver or the customer
    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: user.id },
    });

    const isDriver = logisticsProfile?.id === existingBooking.driverId;
    const isCustomer = existingBooking.userId === user.id;

    if (!isDriver && !isCustomer) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Update booking
    const updateData: any = { status };
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }

    const booking = await prisma.logisticsBooking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true },
        },
        driver: {
          select: {
            companyName: true,
            phone: true,
            userId: true,
          },
        },
      },
    });

    // Send notification to the other party
    const notifyUserId = isDriver
      ? existingBooking.userId
      : existingBooking.driver?.userId;

    if (notifyUserId) {
      try {
        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            type: "DELIVERY",
            title: "Delivery Status Updated",
            message: `Your delivery has been ${status
              .toLowerCase()
              .replace("_", " ")}`,
            link: isDriver
              ? `/dashboard/buyer/bookings`
              : `/dashboard/logistics/bookings`,
          },
        });
      } catch (notifError) {
        console.warn("Notification failed:", notifError);
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permission
    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: user.id },
    });

    const isDriver = logisticsProfile?.id === booking.driverId;
    const isCustomer = booking.userId === user.id;

    if (!isDriver && !isCustomer) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.logisticsBooking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
