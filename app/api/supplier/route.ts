// app/api/supplier/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all suppliers (public or admin)
export async function GET() {
  try {
    const suppliers = await prisma.supplierProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("❌ GET /api/supplier error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST new supplier (requires login)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

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
    } = data;

    // Validate required fields
    if (!businessName || !businessAddress || !city || !state) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: businessName, businessAddress, city, state",
        },
        { status: 400 }
      );
    }

    // Check for existing profile
    const existing = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a supplier profile" },
        { status: 409 }
      );
    }

    // Create supplier profile and update user role
    const supplier = await prisma.supplierProfile.create({
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
        verified: true,
        approved: false,
      },
    });

    // Update user role to SUPPLIER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SUPPLIER" },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST /api/supplier error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a supplier profile" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create supplier profile" },
      { status: 500 }
    );
  }
}
