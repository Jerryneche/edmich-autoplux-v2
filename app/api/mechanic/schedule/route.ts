import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

export type DaySchedule = {
  day: string; // e.g., "Monday", "Tuesday", etc.
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
  isWorking: boolean;
};

/**
 * GET /api/mechanic/schedule
 * Fetch mechanic's working schedule
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
      select: { workingHours: true },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { error: "Mechanic profile not found" },
        { status: 404 }
      );
    }

    let schedule: DaySchedule[] = [];
    if (mechanicProfile.workingHours) {
      try {
        schedule = JSON.parse(mechanicProfile.workingHours);
      } catch (e) {
        schedule = [];
      }
    }

    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (error: any) {
    console.error("Error fetching mechanic schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/mechanic/schedule
 * Update mechanic's working schedule
 * 
 * Body: { schedule: DaySchedule[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schedule } = await request.json();

    if (!Array.isArray(schedule)) {
      return NextResponse.json(
        { error: "schedule must be an array" },
        { status: 400 }
      );
    }

    // Validate schedule structure
    for (const day of schedule) {
      if (!day.day || !day.startTime || !day.endTime || day.isWorking === undefined) {
        return NextResponse.json(
          { error: "Each schedule item must have day, startTime, endTime, and isWorking" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.mechanicProfile.update({
      where: { userId: user.id },
      data: {
        workingHours: JSON.stringify(schedule),
      },
      select: { workingHours: true },
    });

    return NextResponse.json({
      success: true,
      schedule: JSON.parse(updated.workingHours || "[]"),
    });
  } catch (error: any) {
    console.error("Error updating mechanic schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
