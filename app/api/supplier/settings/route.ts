// app/api/supplier/settings/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Find supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
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
