import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      make,
      model,
      year,
      vin,
      color,
      mileage,
      engineType,
      transmission,
      nickname,
    } = data;

    // Check if VIN already exists
    if (vin) {
      const existing = await prisma.vehicle.findUnique({
        where: { vin },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Vehicle with this VIN already exists" },
          { status: 400 }
        );
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: session.user.id,
        make,
        model,
        year: parseInt(year),
        vin,
        color,
        mileage: mileage ? parseInt(mileage) : null,
        engineType,
        transmission,
        nickname,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Vehicle creation error:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("id");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID required" },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
