// app/api/supplier/settings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    // Support both mobile JWT and web session auth
    let userId: string | null = null;
    let userRole: string | null = null;

    const mobileUser = await getAuthUser(req);
    if (mobileUser) {
      userId = mobileUser.id;
      userRole = mobileUser.role;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        userRole = session.user.role;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Find supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Update profile with new data
    const updated = await prisma.supplierProfile.update({
      where: { id: supplierProfile.id },
      data: {
        businessName: body.businessName,
        description: body.description,
        city: body.city,
        state: body.state,
        businessAddress: body.businessAddress,
        tagline: body.tagline || null,
        website: body.website || null,
        instagram: body.instagram || null,
        facebook: body.facebook || null,
        twitter: body.twitter || null,
        whatsapp: body.whatsapp || null,
        tiktok: body.tiktok || null,
        businessHours: body.businessHours || null,
        coverImage: body.coverImage || null,
        logo: body.logo || null,
        metaDescription: body.metaDescription || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// PUT - Alias for PATCH (mobile apps may use PUT)
export async function PUT(req: NextRequest) {
  return PATCH(req);
}

// GET - Load supplier profile
export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    let userRole: string | null = null;

    const mobileUser = await getAuthUser(req);
    if (mobileUser) {
      userId = mobileUser.id;
      userRole = mobileUser.role;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        userRole = session.user.role;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can access settings" },
        { status: 403 }
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplierProfile);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
