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
    const {
      specialty,
      experience,
      location,
      city,
      state,
      hourlyRate,
      bio,
      certifications,
      workingHours,
    } = body;

    // Validate required fields
    if (
      !specialty ||
      !experience ||
      !location ||
      !city ||
      !state ||
      !hourlyRate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create mechanic profile
    const mechanicProfile = await prisma.mechanicProfile.create({
      data: {
        userId: session.user.id,
        specialty,
        experience,
        location,
        city,
        state,
        hourlyRate: parseFloat(hourlyRate),
        bio,
        certifications: certifications || [],
        workingHours,
        responseTime: "Within 2 hours",
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      { mechanicProfile, message: "Mechanic profile created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Mechanic onboarding error:", error);
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

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!mechanicProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ mechanicProfile }, { status: 200 });
  } catch (error) {
    console.error("Get mechanic profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
