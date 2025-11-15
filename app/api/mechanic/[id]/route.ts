// app/api/mechanic/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch single mechanic profile (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Fetching mechanic with ID:", id);

    // Try to find mechanic by user ID first
    let mechanic = await prisma.mechanicProfile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // If not found by userId, try by mechanicProfile.id
    if (!mechanic) {
      mechanic = await prisma.mechanicProfile.findUnique({
        where: { id: id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }

    if (!mechanic) {
      console.log("Mechanic not found for ID:", id);
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 }
      );
    }

    console.log("Mechanic found:", mechanic.businessName);

    return NextResponse.json(mechanic);
  } catch (error: any) {
    console.error("Error fetching mechanic:", error);
    return NextResponse.json(
      { error: "Failed to fetch mechanic" },
      { status: 500 }
    );
  }
}
