// app/api/mobile/trade-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - List user's trade-in requests
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tradeIns = await prisma.tradeIn.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({ tradeIns }, { status: 200 });
  } catch (error: any) {
    console.error("[TRADE-IN GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trade-ins" },
      { status: 500 },
    );
  }
}

// POST - Create new trade-in request
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemName,
      category,
      brand,
      condition,
      description,
      images,
      askingPrice,
      preferredMethod, // "CREDIT" | "CASH" | "EXCHANGE"
      vehicleMake,
      vehicleModel,
      vehicleYear,
      partNumber,
    } = body;

    // Validation
    if (!itemName || !category || !condition) {
      return NextResponse.json(
        { error: "Item name, category, and condition are required" },
        { status: 400 },
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    // Create trade-in request
    const tradeIn = await prisma.tradeIn.create({
      data: {
        userId: user.id,
        itemName,
        category,
        brand: brand || null,
        condition, // "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
        description: description || null,
        images,
        askingPrice: askingPrice ? parseFloat(askingPrice) : null,
        preferredMethod: preferredMethod || "CREDIT",
        vehicleMake: vehicleMake || null,
        vehicleModel: vehicleModel || null,
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        partNumber: partNumber || null,
        status: "PENDING", // PENDING | REVIEWING | OFFER_MADE | ACCEPTED | REJECTED | COMPLETED
      },
    });

    return NextResponse.json(
      {
        message: "Trade-in request submitted successfully",
        tradeIn,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[TRADE-IN POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trade-in request" },
      { status: 500 },
    );
  }
}
