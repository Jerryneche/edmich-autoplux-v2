// app/api/user/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Fetch all saved addresses for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address, city, state, zipCode, isDefault } = body;

    // Validate required fields
    if (!fullName || !phone || !address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode?.trim() || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
