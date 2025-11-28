// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, username, email, password, phone } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if username exists (if provided)
    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username: username?.toLowerCase() || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        verificationCode,
        verificationExpiry,
        emailVerified: null, // Not verified yet
        isGoogleAuth: false,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message:
        "Registration successful! Check your email for verification code.",
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
