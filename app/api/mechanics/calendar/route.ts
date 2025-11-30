// app/api/mechanic/calendar/route.ts (or wherever it is)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (month < 0 || month > 11 || year < 2020) {
      return NextResponse.json(
        { error: "Invalid month/year" },
        { status: 400 }
      );
    }

    // Format: "2025-04-15" → filter by string prefix for the month
    const monthStr = String(month + 1).padStart(2, "0"); // 0-indexed → 1-indexed
    const yearMonth = `${year}-${monthStr}`;

    const bookings = await prisma.mechanicBooking.findMany({
      where: {
        // mechanicId is the MechanicProfile.id
        mechanicId: (
          await prisma.mechanicProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          })
        )?.id,
        date: {
          startsWith: yearMonth, // "2025-04"
        },
      },
      include: {
        user: {
          // ← Correct relation: user, not buyer
          select: {
            name: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Get mechanic profile for availability settings
    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        workingHours: true,
        isAvailable: true,
        // Note: you don't have workingDays field → add it if needed
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
      availability: mechanicProfile || { isAvailable: false },
    });
  } catch (error: any) {
    console.error("Mechanic calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workingHours, isAvailable } = body;

    const updated = await prisma.mechanicProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(workingHours && { workingHours }),
        ...(typeof isAvailable === "boolean" && { isAvailable }),
      },
      select: {
        workingHours: true,
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
      availability: updated,
    });
  } catch (error: any) {
    console.error("Update mechanic availability error:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
