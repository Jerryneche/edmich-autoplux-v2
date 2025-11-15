import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check mechanic onboarding status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { hasProfile: false, mechanicProfile: null },
        { status: 200 }
      );
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { hasProfile: false, mechanicProfile: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { hasProfile: true, mechanicProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking mechanic profile:", error);
    return NextResponse.json(
      { hasProfile: false, mechanicProfile: null },
      { status: 200 }
    );
  }
}

// ✅ POST - Create or update mechanic profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MECHANIC") {
      return NextResponse.json(
        { error: "Only mechanics can create profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const mechanicProfile = await prisma.mechanicProfile.upsert({
      where: { userId: session.user.id },
      update: { ...body },
      create: {
        ...body,
        userId: session.user.id,
        verified: false,
        approved: true, // Auto-approve for now
        available: true,
        rating: 0,
        completedJobs: 0,
      },
    });

    // ✅ Mark onboarding as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      {
        message: "Mechanic profile created successfully",
        mechanicProfile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating mechanic profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create mechanic profile" },
      { status: 500 }
    );
  }
}
