// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth-api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email || body.emailOrUsername;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedEmail }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Please use Google sign-in for this account" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email first",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Generate JWT token for mobile app
    const token = generateToken(user.id, user.email, user.role);

    // Determine redirect based on role and onboarding
    let redirectUrl = "/dashboard";
    if (user.onboardingStatus === "PENDING" && user.role !== "BUYER") {
      redirectUrl = `/onboarding/${user.role.toLowerCase()}`;
    } else {
      switch (user.role) {
        case "BUYER":
          redirectUrl = "/dashboard/buyer";
          break;
        case "SUPPLIER":
          redirectUrl = "/dashboard/supplier";
          break;
        case "MECHANIC":
          redirectUrl = "/dashboard/mechanic";
          break;
        case "LOGISTICS":
          redirectUrl = "/dashboard/logistics";
          break;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token, // JWT token for mobile
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
      },
    });
  } catch (error: unknown) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
