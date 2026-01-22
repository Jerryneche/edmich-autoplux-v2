import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

export type CoverageArea = {
  areaName: string;
  city: string;
  state: string;
  radius?: number; // in kilometers
  isActive: boolean;
};

/**
 * GET /api/logistics/coverage
 * Fetch logistics provider's service coverage areas
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
        coverageAreas: true,
        city: true,
        state: true,
      },
    });

    if (!logisticsProfile) {
      return NextResponse.json(
        { error: "Logistics profile not found" },
        { status: 404 }
      );
    }

    let coverageAreas: CoverageArea[] = [];

    // Parse existing coverage areas
    if (logisticsProfile.coverageAreas && logisticsProfile.coverageAreas.length > 0) {
      try {
        // Check if they're JSON strings or plain strings
        coverageAreas = logisticsProfile.coverageAreas.map((area) => {
          try {
            return typeof area === "string" && area.includes("{")
              ? JSON.parse(area)
              : {
                  areaName: area,
                  city: logisticsProfile.city,
                  state: logisticsProfile.state,
                  isActive: true,
                };
          } catch {
            return {
              areaName: area,
              city: logisticsProfile.city,
              state: logisticsProfile.state,
              isActive: true,
            };
          }
        });
      } catch (e) {
        // If parsing fails, return empty array
        coverageAreas = [];
      }
    }

    return NextResponse.json({
      success: true,
      coverageAreas,
    });
  } catch (error: any) {
    console.error("Error fetching logistics coverage:", error);
    return NextResponse.json(
      { error: "Failed to fetch coverage areas" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/logistics/coverage
 * Update logistics provider's service coverage areas
 * 
 * Body: { coverageAreas: CoverageArea[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coverageAreas } = await request.json();

    if (!Array.isArray(coverageAreas)) {
      return NextResponse.json(
        { error: "coverageAreas must be an array" },
        { status: 400 }
      );
    }

    // Validate coverage area structure
    for (const area of coverageAreas) {
      if (!area.areaName || !area.city || !area.state || area.isActive === undefined) {
        return NextResponse.json(
          { error: "Each coverage area must have areaName, city, state, and isActive" },
          { status: 400 }
        );
      }
    }

    // Convert to storable format
    const storageAreas = coverageAreas.map((area) => JSON.stringify(area));

    const updated = await prisma.logisticsProfile.update({
      where: { userId: user.id },
      data: {
        coverageAreas: storageAreas,
      },
      select: {
        coverageAreas: true,
      },
    });

    // Parse back to return
    const parsedAreas: CoverageArea[] = updated.coverageAreas.map((area) => {
      try {
        return JSON.parse(area);
      } catch {
        return { areaName: area, isActive: true };
      }
    });

    return NextResponse.json({
      success: true,
      coverageAreas: parsedAreas,
    });
  } catch (error: any) {
    console.error("Error updating logistics coverage:", error);
    return NextResponse.json(
      { error: "Failed to update coverage areas" },
      { status: 500 }
    );
  }
}
