import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET - Check supplier onboarding status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { hasProfile: false, supplierProfile: null },
        { status: 200 }
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can create profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
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
    } = body;

    if (!businessName || !businessAddress || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    let supplierProfile;

    if (existingProfile) {
      // Update existing profile
      supplierProfile = await prisma.supplierProfile.update({
        where: { userId: session.user.id },
        data: {
          businessName,
          businessAddress,
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
          userId: session.user.id,
          businessName,
          businessAddress,
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
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      {
        message: "Supplier profile created successfully",
        supplierProfile,
      },
      { status: existingProfile ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Error creating supplier profile:", error);

    // Better error handling
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
