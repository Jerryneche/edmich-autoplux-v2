// app/api/upload/profile-photo/route.ts
// ===========================================
// Profile Photo Upload with Cloudinary
// ===========================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Try session auth first (web), then JWT (mobile)
    let userId: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Try JWT token for mobile
      const token = request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded?.userId) {
          userId = decoded.userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP allowed." },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB allowed." },
        { status: 400 },
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "edmich/profiles",
      public_id: `user-${userId}-${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
      overwrite: true,
    });

    // Update user image in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: result.secure_url },
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload photo" },
      { status: 500 },
    );
  }
}
