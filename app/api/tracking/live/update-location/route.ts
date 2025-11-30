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

    // Ensure numbers (could be strings from client)
    const orderId = body.orderId as string;
    const latitude =
      body.latitude !== undefined && body.latitude !== null
        ? Number(body.latitude)
        : null;
    const longitude =
      body.longitude !== undefined && body.longitude !== null
        ? Number(body.longitude)
        : null;

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    // Verify driver is assigned to this order
    const tracking = await prisma.orderTracking.findFirst({
      where: {
        orderId,
        driverId: session.user.id,
      },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Not authorized for this order" },
        { status: 403 }
      );
    }

    // Update driver location (allow null checks)
    await prisma.orderTracking.update({
      where: { id: tracking.id },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationUpdate: new Date(),
      },
    });

    // Calculate ETA only if delivery coordinates and current coords exist
    let eta = null;
    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      typeof tracking.deliveryLat === "number" &&
      typeof tracking.deliveryLng === "number"
    ) {
      eta = calculateETA(
        latitude,
        longitude,
        tracking.deliveryLat,
        tracking.deliveryLng
      );
    }

    // Create location update record (store what we have)
    await prisma.trackingUpdate.create({
      data: {
        trackingId: tracking.id,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        status: tracking.status,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      eta,
      distance: eta?.distance ?? null,
    });
  } catch (error) {
    console.error("Location update error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

function calculateETA(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const timeInHours = distance / 40; // 40 km/h
  const timeInMinutes = Math.round(timeInHours * 60);

  return {
    distance: Number(distance.toFixed(2)),
    eta: timeInMinutes,
    formattedEta: `${timeInMinutes} mins`,
  };
}

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}
