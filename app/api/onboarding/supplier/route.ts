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
        { status: 200 }
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { hasProfile: false, supplierProfile: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { hasProfile: true, supplierProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking supplier profile:", error);
    return NextResponse.json(
      { hasProfile: false, supplierProfile: null },
      { status: 200 }
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
        { status: 403 }
      );
    }

    const body = await req.json();

    // Extract fields from request body
    const {
      businessName,
      businessAddress,
      city,
      state,
      description,
      cacNumber,
      bankName,
      accountNumber,
      accountName,
      // Mobile app may send 'address' instead of 'businessAddress'
      address,
    } = body;

    // Support both web (businessAddress) and mobile (address) field names
    const finalAddress = businessAddress || address;

    if (!businessName || !finalAddress || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });

    let supplierProfile;

    if (existingProfile) {
      // Update existing profile
      supplierProfile = await prisma.supplierProfile.update({
        where: { userId: user.id },
        data: {
          businessName,
          businessAddress: finalAddress,
          city,
          state,
          description: description || null,
          cacNumber: cacNumber || null,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          accountName: accountName || null,
        },
      });
    } else {
      // Create new profile
      supplierProfile = await prisma.supplierProfile.create({
        data: {
          userId: user.id,
          businessName,
          businessAddress: finalAddress,
          city,
          state,
          description: description || null,
          cacNumber: cacNumber || null,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          accountName: accountName || null,
          verified: false,
          approved: false,
        },
      });
    }

    // ✅ Mark onboarding as completed
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier profile created successfully",
        supplierProfile,
      },
      { status: existingProfile ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Error creating supplier profile:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "User account not found. Please log out and log in again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create supplier profile" },
      { status: 500 }
    );
  }
}
