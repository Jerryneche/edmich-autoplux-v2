// app/api/onboarding/supplier/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Helper to extract and verify token with detailed logging
async function getAuthUserWithDebug(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  console.log(
    "[SUPPLIER ONBOARDING] Auth header:",
    authHeader ? `${authHeader.substring(0, 50)}...` : "MISSING",
  );

  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  // Extract token - support both "Bearer token" and just "token"
  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return { user: null, error: "No token in authorization header" };
  }

  console.log(
    "[SUPPLIER ONBOARDING] Token preview:",
    token.substring(0, 50) + "...",
  );

  try {
    // Decode without verifying first to see payload
    const decoded = jwt.decode(token);
    console.log(
      "[SUPPLIER ONBOARDING] Token decoded:",
      JSON.stringify(decoded),
    );

    if (!decoded || typeof decoded === "string") {
      return { user: null, error: "Invalid token format" };
    }

    // Now verify with secret
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error(
        "[SUPPLIER ONBOARDING] No JWT_SECRET or NEXTAUTH_SECRET found!",
      );
      return { user: null, error: "Server configuration error - no secret" };
    }

    const verified = jwt.verify(token, secret) as {
      userId?: string;
      id?: string;
      sub?: string;
    };
    console.log(
      "[SUPPLIER ONBOARDING] Token verified:",
      JSON.stringify(verified),
    );

    // Extract user ID from various possible fields
    const userId = verified.userId || verified.id || verified.sub;
    if (!userId) {
      return { user: null, error: "No user ID in token" };
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingStatus: true,
      },
    });

    if (!user) {
      console.log("[SUPPLIER ONBOARDING] User not found for ID:", userId);
      return { user: null, error: `User not found for ID: ${userId}` };
    }

    console.log("[SUPPLIER ONBOARDING] User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { user, error: null };
  } catch (err: any) {
    console.error(
      "[SUPPLIER ONBOARDING] Token verification error:",
      err.message,
    );
    return { user: null, error: `Token verification failed: ${err.message}` };
  }
}

// ✅ GET - Check supplier onboarding status
export async function GET(req: NextRequest) {
  console.log("[SUPPLIER ONBOARDING GET] Starting...");

  try {
    const { user, error } = await getAuthUserWithDebug(req);

    if (!user) {
      console.log("[SUPPLIER ONBOARDING GET] Auth failed:", error);
      return NextResponse.json(
        { hasProfile: false, supplierProfile: null, debug: error },
        { status: 200 },
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    console.log("[SUPPLIER ONBOARDING GET] Profile found:", !!supplierProfile);

    return NextResponse.json(
      { hasProfile: !!supplierProfile, supplierProfile },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SUPPLIER ONBOARDING GET] Error:", message);
    return NextResponse.json(
      { hasProfile: false, supplierProfile: null, debug: message },
      { status: 200 },
    );
  }
}

// ✅ POST - Create or update supplier profile
export async function POST(req: NextRequest) {
  console.log("[SUPPLIER ONBOARDING POST] Starting...");

  try {
    const { user, error } = await getAuthUserWithDebug(req);

    if (!user) {
      console.log("[SUPPLIER ONBOARDING POST] Auth failed:", error);
      return NextResponse.json(
        { error: "Unauthorized", debug: error },
        { status: 401 },
      );
    }

    // Check role
    console.log("[SUPPLIER ONBOARDING POST] User role:", user.role);
    if (user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can create profiles", userRole: user.role },
        { status: 403 },
      );
    }

    const body = await req.json();
    console.log(
      "[SUPPLIER ONBOARDING POST] Request body:",
      JSON.stringify(body),
    );

    // Extract fields - supporting both mobile and web field names
    const {
      businessName,
      businessAddress,
      address,
      city,
      state,
      description,
      cacNumber,
      bankName,
      accountNumber,
      accountName,
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

    // Validate required fields
    const missingFields = [];
    if (!businessName) missingFields.push("businessName");
    if (!finalAddress) missingFields.push("businessAddress or address");
    if (!city) missingFields.push("city");
    if (!state) missingFields.push("state");

    if (missingFields.length > 0) {
      console.log("[SUPPLIER ONBOARDING POST] Missing fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    // Build profile data
    const profileData = {
      businessName,
      businessAddress: finalAddress,
      city,
      state,
      description: description || null,
      cacNumber: cacNumber || null,
      bankName: bankName || null,
      accountNumber: accountNumber || null,
      accountName: accountName || null,
      website: website || null,
      instagram: instagram || null,
      facebook: facebook || null,
      twitter: twitter || null,
      whatsapp: whatsapp || null,
      tiktok: tiktok || null,
      businessHours: businessHours || null,
      tagline: tagline || null,
      coverImage: coverImage || null,
      logo: logo || null,
      metaDescription: metaDescription || null,
      keywords: keywords || [],
    };

    console.log("[SUPPLIER ONBOARDING POST] Profile data prepared");

    // Check if profile exists
    const existingProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    let supplierProfile;

    if (existingProfile) {
      console.log("[SUPPLIER ONBOARDING POST] Updating existing profile");
      supplierProfile = await prisma.supplierProfile.update({
        where: { userId: user.id },
        data: profileData,
      });
    } else {
      console.log("[SUPPLIER ONBOARDING POST] Creating new profile");
      supplierProfile = await prisma.supplierProfile.create({
        data: {
          ...profileData,
          userId: user.id,
          verified: false,
          approved: true, // Auto-approve for now
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

    console.log(
      "[SUPPLIER ONBOARDING POST] Success! Profile ID:",
      supplierProfile.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Supplier profile created successfully",
        supplierProfile,
      },
      { status: existingProfile ? 200 : 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const prismaError = error as { code?: string };

    console.error("[SUPPLIER ONBOARDING POST] Error:", message);

    if (prismaError.code === "P2003") {
      return NextResponse.json(
        {
          error: "User account not found. Please log out and log in again.",
          code: "P2003",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
