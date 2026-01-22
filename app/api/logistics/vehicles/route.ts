import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

export type VehiclePreferences = {
  motorcycle: boolean;
  car: boolean;
  van: boolean;
  truck: boolean;
};

/**
 * GET /api/logistics/vehicles
 * Fetch logistics provider's vehicle type preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logisticsProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: user.id },
      select: {
        vehicleTypes: true,
      },
    });

    if (!logisticsProfile) {
      return NextResponse.json(
        { error: "Logistics profile not found" },
        { status: 404 }
      );
    }

    // Parse vehicle types from storage
    let vehiclePreferences: VehiclePreferences = {
      motorcycle: false,
      car: false,
      van: false,
      truck: false,
    };

    if (logisticsProfile.vehicleTypes && logisticsProfile.vehicleTypes.length > 0) {
      // Check if stored as JSON string or plain strings
      try {
        const firstItem = logisticsProfile.vehicleTypes[0];
        if (firstItem.includes("{")) {
          // Stored as JSON object
          vehiclePreferences = JSON.parse(firstItem);
        } else {
          // Stored as plain strings, convert to boolean map
          logisticsProfile.vehicleTypes.forEach((type) => {
            const lowerType = type.toLowerCase();
            if (lowerType === "motorcycle") vehiclePreferences.motorcycle = true;
            if (lowerType === "car") vehiclePreferences.car = true;
            if (lowerType === "van") vehiclePreferences.van = true;
            if (lowerType === "truck") vehiclePreferences.truck = true;
          });
        }
      } catch (e) {
        // Default values if parsing fails
        vehiclePreferences = {
          motorcycle: false,
          car: false,
          van: false,
          truck: false,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: vehiclePreferences,
    });
  } catch (error: any) {
    console.error("Error fetching vehicle preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle preferences" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/logistics/vehicles
 * Update logistics provider's vehicle type preferences
 * 
 * Body: { motorcycle: boolean, car: boolean, van: boolean, truck: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { motorcycle, car, van, truck } = body;

    // Validate input
    if (
      typeof motorcycle !== "boolean" ||
      typeof car !== "boolean" ||
      typeof van !== "boolean" ||
      typeof truck !== "boolean"
    ) {
      return NextResponse.json(
        { error: "All vehicle types must be boolean values" },
        { status: 400 }
      );
    }

    const vehiclePreferences: VehiclePreferences = {
      motorcycle,
      car,
      van,
      truck,
    };

    // Get selected vehicle types
    const selectedVehicles = Object.entries(vehiclePreferences)
      .filter(([, value]) => value)
      .map(([key]) => key);

    // Store as either JSON string or array of plain strings
    const vehicleTypesToStore = selectedVehicles.length > 0 
      ? [JSON.stringify(vehiclePreferences)] 
      : [];

    const updated = await prisma.logisticsProfile.update({
      where: { userId: user.id },
      data: {
        vehicleTypes: vehicleTypesToStore,
      },
      select: {
        vehicleTypes: true,
      },
    });

    // Parse and return
    let result: VehiclePreferences = {
      motorcycle: false,
      car: false,
      van: false,
      truck: false,
    };

    if (updated.vehicleTypes && updated.vehicleTypes.length > 0) {
      try {
        result = JSON.parse(updated.vehicleTypes[0]);
      } catch {
        result = vehiclePreferences;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating vehicle preferences:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle preferences" },
      { status: 500 }
    );
  }
}
