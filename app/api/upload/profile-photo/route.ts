// app/api/upload/profile-photo/route.ts
// ===========================================
// Profile Photo Upload with Cloudinary
// Fixed with better error handling
// ===========================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to verify JWT token
async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error("[UPLOAD] Cloudinary not configured");
      return NextResponse.json(
        { error: "Image upload service not configured" },
        { status: 500 },
      );
    }

    // Try session auth first (web), then JWT (mobile)
    let userId: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Try JWT token for mobile
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const decoded = await verifyToken(token);
        if (decoded?.userId) {
          userId = decoded.userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      console.error("[UPLOAD] Failed to parse form data:", e);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

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
    let result;
    try {
      result = await cloudinary.uploader.upload(base64, {
        folder: "edmich/profiles",
        public_id: `user-${userId}-${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
        overwrite: true,
      });
    } catch (e: any) {
      console.error("[UPLOAD] Cloudinary upload failed:", e);
      return NextResponse.json(
        { error: "Failed to upload to cloud storage" },
        { status: 500 },
      );
    }

    // Update user image in database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { image: result.secure_url },
      });
    } catch (e) {
      console.error("[UPLOAD] Database update failed:", e);
      // Still return success since image is uploaded
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("[UPLOAD] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload photo" },
      { status: 500 },
    );
  }
}
