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

    const supplierProfile = await prisma.supplierProfile.upsert({
      where: { userId: session.user.id },
      update: { ...body },
      create: {
        ...body,
        userId: session.user.id,
      },
    });

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
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating supplier profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create supplier profile" },
      { status: 500 }
    );
  }
}
