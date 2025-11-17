// app/api/logistics/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid provider ID" },
        { status: 400 }
      );
    }

    console.log("Fetching logistics provider with ID:", id);

    const provider = await prisma.logisticsProfile.findFirst({
      where: {
        OR: [
          { id }, // Direct profile ID
          { userId: id }, // User ID
        ],
      },
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

    if (!provider) {
      console.log("Logistics provider not found for ID:", id);
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

    console.log("Provider found:", provider.companyName);
    return NextResponse.json(provider);
  } catch (error: any) {
    console.error("Error fetching logistics provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}
