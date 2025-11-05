import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, vehicleTypes, coverageAreas } = body;

    // Validate required fields
    if (!companyName || !vehicleTypes || !coverageAreas) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create logistics profile
    const logisticsProfile = await prisma.logisticsProfile.create({
      data: {
        userId: session.user.id,
        companyName,
        vehicleTypes,
        coverageAreas,
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      { logisticsProfile, message: "Logistics profile created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Logistics onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        deliveries: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!logisticsProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ logisticsProfile }, { status: 200 });
  } catch (error) {
    console.error("Get logistics profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
