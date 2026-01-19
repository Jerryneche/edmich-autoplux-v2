// app/api/upload/profile-photo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract user from token
async function getAuthUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  console.log(
    "[PROFILE PHOTO] Auth header:",
    authHeader ? "Present" : "MISSING",
  );

  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return { user: null, error: "No token provided" };
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return { user: null, error: "Server config error - no secret" };
    }

    const decoded = jwt.verify(token, secret) as {
      userId?: string;
      id?: string;
      sub?: string;
    };
    const userId = decoded.userId || decoded.id || decoded.sub;

    if (!userId) {
      return { user: null, error: "No user ID in token" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, image: true },
    });

    if (!user) {
      return { user: null, error: "User not found" };
    }

    return { user, error: null };
  } catch (err: any) {
    console.error("[PROFILE PHOTO] Token error:", err.message);
    return { user: null, error: err.message };
  }
}

export async function POST(req: NextRequest) {
  console.log("[PROFILE PHOTO] Starting upload...");

  try {
    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error("[PROFILE PHOTO] Cloudinary not configured!");
      return NextResponse.json(
        { error: "Image upload service not configured" },
        { status: 500 },
      );
    }

    // Authenticate user
    const { user, error: authError } = await getAuthUserFromToken(req);
    if (!user) {
      console.log("[PROFILE PHOTO] Auth failed:", authError);
      return NextResponse.json(
        { error: "Unauthorized", debug: authError },
        { status: 401 },
      );
    }

    console.log("[PROFILE PHOTO] User authenticated:", user.id);

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("[PROFILE PHOTO] No file in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[PROFILE PHOTO] File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    console.log("[PROFILE PHOTO] Uploading to Cloudinary...");

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "edmich-profiles",
            public_id: `profile-${user.id}-${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("[PROFILE PHOTO] Cloudinary error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });

    console.log(
      "[PROFILE PHOTO] Cloudinary upload success:",
      uploadResult.secure_url,
    );

    // Update user's image in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: uploadResult.secure_url },
      select: { id: true, image: true },
    });

    console.log("[PROFILE PHOTO] Database updated");

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PROFILE PHOTO] Error:", message);

    return NextResponse.json(
      { error: "Failed to upload photo", debug: message },
      { status: 500 },
    );
  }
}
