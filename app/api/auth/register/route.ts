// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, username, email, password, phone, role } = await req.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, email, password, and role are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate username format (if provided)
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          {
            error:
              "Username must be 3-20 characters (letters, numbers, underscore only)",
          },
          { status: 400 }
        );
      }
    }

    // TEST DATABASE CONNECTION FIRST
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
    } catch (dbError: any) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check your database configuration.",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        },
        { status: 503 }
      );
    }

    // Check if email exists
    let existingEmail;
    try {
      existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbError: any) {
      console.error("Database query error (checking email):", dbError);
      return NextResponse.json(
        { error: "Database error. Please try again later." },
        { status: 503 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already registered. Please login instead." },
        { status: 400 }
      );
    }

    // Check if username exists (if provided)
    if (username) {
      let existingUsername;
      try {
        existingUsername = await prisma.user.findFirst({
          where: {
            username: username.toLowerCase(),
          },
        });
      } catch (dbError: any) {
        console.error("Database query error (checking username):", dbError);
        return NextResponse.json(
          { error: "Database error. Please try again later." },
          { status: 503 }
        );
      }

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken. Please choose another one." },
          { status: 400 }
        );
      }
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError: any) {
      console.error("Password hashing error:", hashError);
      return NextResponse.json(
        { error: "Error processing password. Please try again." },
        { status: 500 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          username: username?.toLowerCase() || null,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone: phone || null,
          role: role || "BUYER",
          verificationCode,
          verificationExpiry,
          emailVerified: null, // Not verified yet
          isGoogleAuth: false,
        },
      });

      console.log("✅ User created successfully:", user.id);
    } catch (dbError: any) {
      console.error("Database error (creating user):", dbError);

      // Check for unique constraint violations
      if (dbError.code === "P2002") {
        const field = dbError.meta?.target?.[0] || "field";
        return NextResponse.json(
          { error: `This ${field} is already in use.` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create account. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
      console.log("✅ Verification email sent to:", email);
    } catch (emailError: any) {
      console.error("❌ Email sending failed:", emailError);
      // Don't fail registration if email fails
      // User can request resend code later
    }

    // Disconnect from database
    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message:
        "Registration successful! Check your email for verification code.",
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error("❌ Unexpected registration error:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
