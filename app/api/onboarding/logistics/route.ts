import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check logistics onboarding status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { hasProfile: false, logisticsProfile: null },
        { status: 200 }
      );
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!logisticsProfile) {
      return NextResponse.json(
        { hasProfile: false, logisticsProfile: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { hasProfile: true, logisticsProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking logistics profile:", error);
    return NextResponse.json(
      { hasProfile: false, logisticsProfile: null },
      { status: 200 }
    );
  }
}

// ✅ POST - Create or update logistics profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LOGISTICS") {
      return NextResponse.json(
        { error: "Only logistics providers can create profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const logisticsProfile = await prisma.logisticsProfile.upsert({
      where: { userId: session.user.id },
      update: { ...body },
      create: {
        ...body,
        userId: session.user.id,
        verified: false,
        approved: true, // Auto-approve for now
        available: true,
        rating: 0,
        completedDeliveries: 0,
      },
    });

    // ✅ Mark onboarding as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      {
        message: "Logistics profile created successfully",
        logisticsProfile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating logistics profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create logistics profile" },
      { status: 500 }
    );
  }
}
