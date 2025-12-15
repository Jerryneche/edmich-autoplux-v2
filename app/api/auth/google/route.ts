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

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create new user from Google data
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || "User",
          image: image,
          isGoogleAuth: true, // Use existing field
          emailVerified: new Date(),
          role: "BUYER",
        },
      });
    } else {
      // Update existing user if they haven't used Google before
      if (!user.isGoogleAuth) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isGoogleAuth: true,
            image: user.image || image,
            emailVerified: user.emailVerified || new Date(),
          },
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
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
      },
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
