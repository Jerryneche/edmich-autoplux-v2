// app/api/user/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const ALLOWED_FIELDS = ["phone", "username", "password", "name"] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(req: NextRequest) {
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
    let userEmail: string;
    try {
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || ""
      );
      const { payload } = await jwtVerify(sessionToken, secret);
      userId = payload.userId as string;
      userEmail = payload.email as string;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session. Please login again." },
        { status: 401 }
      );
    }

    const updates = await req.json();

    // Validate that updates is an object
    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Filter only allowed fields
    const filteredUpdates: Record<string, any> = {};

    for (const key of Object.keys(updates)) {
      if (!ALLOWED_FIELDS.includes(key as AllowedField)) {
        return NextResponse.json(
          { error: `Field '${key}' cannot be updated` },
          { status: 400 }
        );
      }

      const value = updates[key];

      // Validate based on field type
      if (key === "password") {
        if (typeof value !== "string" || value.length < 8) {
          return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
          );
        }
        filteredUpdates[key] = await bcrypt.hash(value, 12);
      } else if (key === "username") {
        if (typeof value !== "string") {
          return NextResponse.json(
            { error: "Username must be a string" },
            { status: 400 }
          );
        }

        const usernameRegex = /^[a-z0-9_]{3,20}$/;
        if (!usernameRegex.test(value)) {
          return NextResponse.json(
            {
              error:
                "Username must be 3-20 characters (lowercase letters, numbers, underscore only)",
            },
            { status: 400 }
          );
        }

        // Check if username is taken
        const existing = await prisma.user.findUnique({
          where: { username: value },
          select: { id: true },
        });

        if (existing && existing.id !== userId) {
          return NextResponse.json(
            { error: "Username already taken. Please choose another." },
            { status: 400 }
          );
        }

        filteredUpdates[key] = value.toLowerCase();
      } else if (key === "phone") {
        if (typeof value !== "string") {
          return NextResponse.json(
            { error: "Phone must be a string" },
            { status: 400 }
          );
        }

        const phoneRegex = /^[\d\s\+\-\(\)]{10,20}$/;
        if (!phoneRegex.test(value)) {
          return NextResponse.json(
            { error: "Invalid phone number format" },
            { status: 400 }
          );
        }

        filteredUpdates[key] = value.trim();
      } else if (key === "name") {
        if (typeof value !== "string" || value.length < 2) {
          return NextResponse.json(
            { error: "Name must be at least 2 characters" },
            { status: 400 }
          );
        }

        filteredUpdates[key] = value.trim();
      }
    }

    // Ensure there's something to update
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredUpdates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        username: true,
        image: true,
        updatedAt: true,
      },
    });

    console.log(
      `[PROFILE] Updated fields for ${userEmail}: ${Object.keys(
        filteredUpdates
      ).join(", ")}`
    );

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PROFILE] Update error:", error.message);

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return NextResponse.json(
        { error: `This ${field} is already in use` },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
