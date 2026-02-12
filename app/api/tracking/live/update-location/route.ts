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
    const { trackingId, latitude, longitude } = body;

    if (!trackingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "trackingId, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    // Verify provider is assigned to this tracking
    const tracking = await prisma.orderTracking.findUnique({
      where: { id: trackingId },
      include: {
        driver: true,
      },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    // Check authorization - only assigned provider can update
    if (tracking.driver?.id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized for this tracking" },
        { status: 403 }
      );
    }

    // Update tracking with new location
    const updated = await prisma.orderTracking.update({
      where: { id: trackingId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationUpdate: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create tracking update
    await prisma.trackingUpdate.create({
      data: {
        trackingId: updated.id,
        latitude,
        longitude,
        status: updated.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        currentLat: updated.currentLat,
        currentLng: updated.currentLng,
        lastLocationUpdate: updated.lastLocationUpdate,
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
