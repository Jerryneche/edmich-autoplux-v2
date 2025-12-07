// app/api/user/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId: string;
    try {
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || ""
      );
      const { payload } = await jwtVerify(sessionToken, secret);
      userId = payload.userId as string;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session. Please login again." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `profile-${hash}.${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    const filepath = path.join(uploadDir, filename);

    try {
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      console.log(`[UPLOAD] Saved file: ${filename}`);
    } catch (fsError: any) {
      console.error("[UPLOAD] File system error:", fsError.message);
      return NextResponse.json(
        { error: "Failed to save file. Please try again." },
        { status: 500 }
      );
    }

    // Update user profile with image URL
    const imageUrl = `/uploads/profiles/${filename}`;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          image: imageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          image: true,
        },
      });

      console.log(`[UPLOAD] Updated profile image for user: ${userId}`);

      return NextResponse.json(
        {
          message: "Image uploaded successfully",
          url: imageUrl,
          userId: updatedUser.id,
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error("[UPLOAD] Database error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to update profile. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[UPLOAD] Unexpected error:", error.message);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
