// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "This email is already registered. Please login." },
          { status: 400 }
        );
      }

      // User exists but not verified - update and resend
      const verificationCode = generateVerificationCode();
      const hashedPassword = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name,
          password: hashedPassword,
          phone: phone || null,
          verificationCode,
          verificationExpiry: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await sendVerificationEmail(normalizedEmail, verificationCode);

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
        email: normalizedEmail,
      });
    }

    // Create new user WITH password
    const verificationCode = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 12);
    const username = `user_${normalizedEmail.split("@")[0]}_${Math.floor(
      Math.random() * 10000
    )}`;

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        username,
        password: hashedPassword,
        phone: phone || null,
        verificationCode,
        verificationExpiry: new Date(Date.now() + 15 * 60 * 1000),
        emailVerified: null,
        role: "BUYER", // Default, will be updated in select-role
        onboardingStatus: "PENDING",
        isGoogleAuth: false,
        hasCompletedOnboarding: false,
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationCode);

    return NextResponse.json({
      success: true,
      message: "Account created! Check your email for verification code.",
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error("[REGISTER] Error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
