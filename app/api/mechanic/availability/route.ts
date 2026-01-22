import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

/**
 * GET /api/mechanic/availability
 * Fetch mechanic's availability status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
      select: {
        isAvailable: true,
      },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { error: "Mechanic profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAvailable: mechanicProfile.isAvailable,
      acceptingNewBookings: mechanicProfile.isAvailable,
    });
  } catch (error: any) {
    console.error("Error fetching mechanic availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/mechanic/availability
 * Update mechanic's availability status
 * 
 * Body: { isAvailable: boolean, acceptingNewBookings: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAvailable, acceptingNewBookings } = await request.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean" },
        { status: 400 }
      );
    }

    // Use the primary isAvailable field
    const status = isAvailable && (acceptingNewBookings !== false);

    const updated = await prisma.mechanicProfile.update({
      where: { userId: user.id },
      data: {
        isAvailable: status,
      },
      select: {
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      isAvailable: updated.isAvailable,
      acceptingNewBookings: updated.isAvailable,
    });
  } catch (error: any) {
    console.error("Error updating mechanic availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
