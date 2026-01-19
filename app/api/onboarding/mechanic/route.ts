// app/api/onboarding/mechanic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check mechanic onboarding status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { hasProfile: false, mechanicProfile: null },
        { status: 200 },
      );
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { hasProfile: false, mechanicProfile: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { hasProfile: true, mechanicProfile },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error checking mechanic profile:", error);
    return NextResponse.json(
      { hasProfile: false, mechanicProfile: null },
      { status: 200 },
    );
  }
}

// ✅ POST - Create or update mechanic profile
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "MECHANIC") {
      return NextResponse.json(
        { error: "Only mechanics can create profiles" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Extract fields - supporting both mobile and web field names
    const {
      // Required fields per schema
      businessName,
      phone,
      address,
      city,
      state,
      experience,
      hourlyRate,
      specialty, // Primary specialty (required in schema)
      specialization, // Array of specializations
      specializations, // Alternative name from mobile

      // Optional fields
      description,
      bio,
      certifications,
      workingHours,
      responseTime,
      latitude,
      longitude,
      basePrice,
      mobileService, // Maps to 'available' (legacy) for mobile service flag
    } = body;

    // Validate required fields per schema
    if (!businessName || !phone || !address || !city || !state) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: businessName, phone, address, city, state",
        },
        { status: 400 },
      );
    }

    if (experience === undefined || hourlyRate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: experience, hourlyRate" },
        { status: 400 },
      );
    }

    // Handle specialization array - accept from multiple field names
    const specializationArray = specialization || specializations || [];

    // Primary specialty - use provided or first from array or default
    const primarySpecialty =
      specialty || specializationArray[0] || "General Repairs";

    // Build profile data matching schema exactly
    const profileData = {
      businessName,
      phone,
      address,
      city,
      state,
      experience: parseInt(String(experience)) || 0,
      hourlyRate: parseFloat(String(hourlyRate)) || 0,
      specialty: primarySpecialty, // Required String
      specialization: specializationArray, // String[] @default([])
      location: `${city}, ${state}`, // Required String
      description: description || null, // String?
      bio: bio || null, // String?
      certifications: certifications || [], // String[] @default([])
      workingHours: workingHours || null, // String?
      responseTime: responseTime || null, // String?
      latitude: latitude ? parseFloat(String(latitude)) : null, // Float?
      longitude: longitude ? parseFloat(String(longitude)) : null, // Float?
      basePrice: basePrice ? parseFloat(String(basePrice)) : 0, // Float? @default(0)
      isAvailable: true, // Boolean @default(true)
      available: mobileService ?? true, // Boolean? (legacy alias)
    };

    const mechanicProfile = await prisma.mechanicProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: user.id,
        verified: false, // Boolean @default(false)
        approved: true, // Auto-approve for now
        rating: 0, // Float @default(0)
        completedJobs: 0, // Int @default(0)
      },
    });

    // Mark onboarding as completed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: "COMPLETED",
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Mechanic profile created successfully",
        mechanicProfile,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating mechanic profile:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create mechanic profile";
    const prismaError = error as { code?: string };

    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "User account not found. Please log out and log in again." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
