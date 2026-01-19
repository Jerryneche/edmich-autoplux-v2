// app/api/onboarding/logistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check logistics onboarding status
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { hasProfile: false, logisticsProfile: null },
        { status: 200 },
      );
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: user.id },
    });

    if (!logisticsProfile) {
      return NextResponse.json(
        { hasProfile: false, logisticsProfile: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { hasProfile: true, logisticsProfile },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error checking logistics profile:", error);
    return NextResponse.json(
      { hasProfile: false, logisticsProfile: null },
      { status: 200 },
    );
  }
}

// ✅ POST - Create or update logistics profile
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "LOGISTICS") {
      return NextResponse.json(
        { error: "Only logistics providers can create profiles" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Extract fields - supporting both mobile and web field names
    const {
      // Required fields per schema
      companyName,
      phone,
      address,
      city,
      state,
      vehicleType, // Required String - primary vehicle type
      vehicleNumber, // Required String
      licenseNumber, // Required String

      // Optional fields
      description,
      vehicleTypes, // String[] @default([]) - additional vehicle types
      coverageAreas, // String[] @default([])
      currentLat, // Float?
      currentLng, // Float?
    } = body;

    // Validate required fields per schema
    if (!companyName || !phone || !address || !city || !state) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: companyName, phone, address, city, state",
        },
        { status: 400 },
      );
    }

    if (!vehicleType || !vehicleNumber || !licenseNumber) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: vehicleType, vehicleNumber, licenseNumber",
        },
        { status: 400 },
      );
    }

    // Build profile data matching schema exactly
    const profileData = {
      companyName, // Required String
      phone, // Required String
      address, // Required String
      city, // Required String
      state, // Required String
      vehicleType, // Required String
      vehicleNumber, // Required String
      licenseNumber, // Required String
      description: description || null, // String?
      vehicleTypes: vehicleTypes || [], // String[] @default([])
      coverageAreas: coverageAreas || [], // String[] @default([])
      currentLat: currentLat ? parseFloat(String(currentLat)) : null, // Float?
      currentLng: currentLng ? parseFloat(String(currentLng)) : null, // Float?
      isAvailable: true, // Boolean @default(true)
      available: true, // Boolean? (legacy alias)
    };

    const logisticsProfile = await prisma.logisticsProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: user.id,
        verified: false, // Boolean @default(false)
        approved: true, // Auto-approve for now
        rating: 0, // Float @default(0)
        completedDeliveries: 0, // Int @default(0)
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
        message: "Logistics profile created successfully",
        logisticsProfile,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating logistics profile:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create logistics profile";
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
