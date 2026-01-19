// app/api/onboarding/supplier/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check supplier onboarding status
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { hasProfile: false, supplierProfile: null },
        { status: 200 },
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { hasProfile: false, supplierProfile: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { hasProfile: true, supplierProfile },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error checking supplier profile:", error);
    return NextResponse.json(
      { hasProfile: false, supplierProfile: null },
      { status: 200 },
    );
  }
}

// ✅ POST - Create or update supplier profile
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can create profiles" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Extract fields - supporting both mobile and web field names
    const {
      // Required fields per schema
      businessName,
      businessAddress, // Required String
      address, // Alternative name from mobile
      city,
      state,

      // Optional fields
      description,
      cacNumber,
      bankName,
      accountNumber,
      accountName,

      // Marketing/branding fields (all optional)
      website,
      instagram,
      facebook,
      twitter,
      whatsapp,
      tiktok,
      businessHours,
      tagline,
      coverImage,
      logo,
      metaDescription,
      keywords,
    } = body;

    // Support both field names for address
    const finalAddress = businessAddress || address;

    // Validate required fields per schema
    if (!businessName || !finalAddress || !city || !state) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: businessName, businessAddress/address, city, state",
        },
        { status: 400 },
      );
    }

    // Build profile data matching schema exactly
    const profileData = {
      businessName, // Required String
      businessAddress: finalAddress, // Required String
      city, // Required String
      state, // Required String
      description: description || null, // String?
      cacNumber: cacNumber || null, // String?
      bankName: bankName || null, // String?
      accountNumber: accountNumber || null, // String?
      accountName: accountName || null, // String?

      // Marketing fields
      website: website || null, // String?
      instagram: instagram || null, // String?
      facebook: facebook || null, // String?
      twitter: twitter || null, // String?
      whatsapp: whatsapp || null, // String?
      tiktok: tiktok || null, // String?
      businessHours: businessHours || null, // String?
      tagline: tagline || null, // String?
      coverImage: coverImage || null, // String?
      logo: logo || null, // String?
      metaDescription: metaDescription || null, // String?
      keywords: keywords || [], // String[] @default([])
    };

    // Check if profile already exists
    const existingProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    let supplierProfile;

    if (existingProfile) {
      supplierProfile = await prisma.supplierProfile.update({
        where: { userId: user.id },
        data: profileData,
      });
    } else {
      supplierProfile = await prisma.supplierProfile.create({
        data: {
          ...profileData,
          userId: user.id,
          verified: false, // Boolean @default(false)
          approved: false, // Boolean @default(false) - suppliers need admin approval
        },
      });
    }

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
        message: "Supplier profile created successfully",
        supplierProfile,
      },
      { status: existingProfile ? 200 : 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating supplier profile:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create supplier profile";
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
