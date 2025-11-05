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

    // Validate required fields
    if (!businessName || !businessAddress || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create supplier profile
    const supplierProfile = await prisma.supplierProfile.create({
      data: {
        userId: session.user.id,
        businessName,
        businessAddress,
        city,
        state,
        description,
        cacNumber,
        bankName,
        accountNumber,
        accountName,
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStatus: "COMPLETED" },
    });

    return NextResponse.json(
      { supplierProfile, message: "Supplier profile created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Supplier onboarding error:", error);
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

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        products: true,
      },
    });

    if (!supplierProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ supplierProfile }, { status: 200 });
  } catch (error) {
    console.error("Get supplier profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
