// app/api/logistics/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch single logistics provider profile (public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Fetching logistics provider with ID:", id);

    // Try to find by user ID first
    let provider = await prisma.logisticsProfile.findUnique({
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

    // If not found by userId, try by logisticsProfile.id
    if (!provider) {
      provider = await prisma.logisticsProfile.findUnique({
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

    if (!provider) {
      console.log("Logistics provider not found for ID:", id);
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

    console.log("Logistics provider found:", provider.companyName);

    return NextResponse.json(provider);
  } catch (error: any) {
    console.error("Error fetching logistics provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch logistics provider" },
      { status: 500 }
    );
  }
}
