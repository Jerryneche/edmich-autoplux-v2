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
        { status: 200 }
      );
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
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
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "MECHANIC") {
      return NextResponse.json(
        { error: "Only mechanics can create profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Extract and validate fields from body
    const {
      businessName,
      phone,
      address,
      city,
      state,
      experience,
      description,
      specializations,
      mobileService,
      hourlyRate,
    } = body;

    // Build the profile data
    const profileData = {
      businessName: businessName || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      experience: experience || 0,
      description: description || "",
      specialization: specializations || [], // Maps to specialization field in schema
      specialty: specializations?.[0] || "General Repairs", // Primary specialty
      location: `${city}, ${state}`,
      hourlyRate: hourlyRate || 0,
      isAvailable: true,
      available: mobileService ?? true,
    };

    const mechanicProfile = await prisma.mechanicProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: user.id,
        verified: false,
        approved: true, // Auto-approve for now
        rating: 0,
        completedJobs: 0,
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
