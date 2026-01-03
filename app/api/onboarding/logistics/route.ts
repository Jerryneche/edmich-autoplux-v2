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
        { status: 200 }
      );
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: user.id },
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
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "LOGISTICS") {
      return NextResponse.json(
        { error: "Only logistics providers can create profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Extract and validate fields from body
    const {
      companyName,
      phone,
      address,
      city,
      state,
      description,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      vehicleTypes,
      coverageAreas,
    } = body;

    // Build the profile data
    const profileData = {
      companyName: companyName || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      description: description || "",
      vehicleType: vehicleType || vehicleTypes?.[0] || "Van",
      vehicleNumber: vehicleNumber || "",
      licenseNumber: licenseNumber || "",
      vehicleTypes: vehicleTypes || [],
      coverageAreas: coverageAreas || [],
      isAvailable: true,
      available: true,
    };

    const logisticsProfile = await prisma.logisticsProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: user.id,
        verified: false,
        approved: true, // Auto-approve for now
        rating: 0,
        completedDeliveries: 0,
      },
    });

    // ✅ Mark onboarding as completed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: "COMPLETED",
        hasCompletedOnboarding: true,
      },
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
