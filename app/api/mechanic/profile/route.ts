import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch mechanic's own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MECHANIC") {
      return NextResponse.json(
        { error: "Only mechanics can access this" },
        { status: 403 }
      );
    }

    const profile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        bookings: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      hasProfile: !!profile,
      profile,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update mechanic profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MECHANIC") {
      return NextResponse.json(
        { error: "Only mechanics can update profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      specialty,
      specialization,
      address,
      city,
      state,
      phone,
      experience,
      hourlyRate,
      bio,
      certifications,
      workingHours,
      responseTime,
      available,
    } = body;

    const profile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updatedProfile = await prisma.mechanicProfile.update({
      where: { userId: session.user.id },
      data: {
        businessName,
        specialty,
        specialization,
        address,
        city,
        state,
        phone,
        experience: parseInt(experience),
        hourlyRate: parseFloat(hourlyRate),
        bio,
        description: bio,
        certifications,
        workingHours,
        responseTime,
        available,
        location: `${city}, ${state}`,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
