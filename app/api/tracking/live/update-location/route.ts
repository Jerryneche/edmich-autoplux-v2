import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trackingId, location, message } = body;

    if (!trackingId || !location) {
      return NextResponse.json(
        { error: "trackingId and location are required" },
        { status: 400 }
      );
    }

    // Verify provider is assigned to this tracking
    const tracking = await prisma.orderTracking.findUnique({
      where: { id: trackingId },
      include: {
        driver: {
          select: { userId: true },
        },
      },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    // Check authorization - only assigned provider can update
    if (tracking.driver?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized for this tracking" },
        { status: 403 }
      );
    }

    // Update tracking with new location
    const updated = await prisma.orderTracking.update({
      where: { id: trackingId },
      data: {
        lastLocation: location,
        updatedAt: new Date(),
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        trackingId: updated.id,
        status: updated.status,
        location: location,
        message: message || `Location updated to ${location}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        trackingNumber: updated.trackingNumber,
        lastLocation: updated.lastLocation,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Location update error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
