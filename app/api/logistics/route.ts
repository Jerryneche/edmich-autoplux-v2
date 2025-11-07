// app/api/logistics/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const { pickup, dropoff, vehicle, deliveryDate, weight, notes } = data;

  // Required fields
  if (!pickup || !dropoff || !vehicle || !deliveryDate) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: pickup, dropoff, vehicle, deliveryDate",
      },
      { status: 400 }
    );
  }

  try {
    const logisticsRequest = await prisma.logisticsRequest.create({
      data: {
        userId: session.user.id,
        pickup,
        dropoff,
        vehicle,
        deliveryDate: new Date(deliveryDate),
        weight: weight || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(logisticsRequest, { status: 201 });
  } catch (error: any) {
    console.error("Logistics request error:", error);
    return NextResponse.json(
      { error: "Failed to create logistics request" },
      { status: 500 }
    );
  }
}
