// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting - prevent brute force
    const ip =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      "unknown";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 1 minute." },
        { status: 429 }
      );
    }

    const { email, otp } = await req.json();

    // Validate inputs
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user and verify OTP
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        verificationCode: true,
        verificationExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Check if OTP exists
    if (!user.verificationCode || !user.verificationExpiry) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date() > user.verificationExpiry) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.verificationCode !== otp) {
      console.warn(`[OTP] Invalid code attempt for: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    console.log(`[OTP] Email verified: ${normalizedEmail}`);

    // Return user data for client-side NextAuth session creation
    return NextResponse.json(
      {
        message: "Email verified successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        // Flag to indicate this needs NextAuth session
        requiresSessionCreation: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[OTP] Verify error:", error.message);

    return NextResponse.json(
      { error: "Failed to verify code. Please try again." },
      { status: 500 }
    );
  }
}
