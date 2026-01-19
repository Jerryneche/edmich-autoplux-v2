// app/api/auth/google/route.ts
// ===========================================
// Google OAuth Authentication
// Updated to include googleId and hasPassword
// ===========================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  try {
    const { googleId, email, name, image } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!googleId) {
      return NextResponse.json(
        { error: "Google ID is required" },
        { status: 400 },
      );
    }

    // Find existing user by email OR googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { googleId: googleId }],
      },
    });

    if (!user) {
      // Create new user from Google data
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || "User",
          image: image,
          googleId: googleId,
          isGoogleAuth: true,
          hasPassword: false, // Google users don't have password initially
          emailVerified: new Date(),
          role: "BUYER",
          onboardingStatus: "COMPLETED",
        },
      });
    } else {
      // Update existing user
      const updateData: any = {
        isGoogleAuth: true,
        emailVerified: user.emailVerified || new Date(),
      };

      // Only update googleId if not already set
      if (!user.googleId) {
        updateData.googleId = googleId;
      }

      // Update image only if user doesn't have one
      if (!user.image && image) {
        updateData.image = image;
      }

      // Update name only if user doesn't have one
      if (!user.name && name) {
        updateData.name = name;
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        image: user.image,
        role: user.role,
        emailVerified: true,
        isGoogleAuth: user.isGoogleAuth,
        hasPassword: user.hasPassword,
        onboardingStatus: user.onboardingStatus,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
