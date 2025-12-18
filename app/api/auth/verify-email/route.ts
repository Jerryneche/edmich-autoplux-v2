// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.toString().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found. Please sign up first." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email already verified",
        email: normalizedEmail,
        alreadyVerified: true,
      });
    }

    if (!user.verificationCode || user.verificationCode !== normalizedCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (user.verificationExpiry && new Date() > user.verificationExpiry) {
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    console.log(`[VERIFY-EMAIL] Verified: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error("[VERIFY-EMAIL] Error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
