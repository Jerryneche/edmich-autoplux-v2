import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    let userEmail: string | null = null;

    // 1. Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase();
      console.log("[PROFILE] Using NextAuth session:", userEmail);
    }

    // 2. Try JWT cookies if no NextAuth session
    if (!userEmail) {
      const possibleCookies = [
        "session",
        "auth-token",
        "otp-session",
        "email-session",
        "tempUser",
      ];

      const cookieName = possibleCookies.find((name) => req.cookies.get(name));

      if (cookieName) {
        const token = req.cookies.get(cookieName)!.value;

        try {
          const secret = new TextEncoder().encode(
            process.env.NEXTAUTH_SECRET || ""
          );
          const { payload } = await jwtVerify(token, secret);

          if (payload.email) {
            userEmail = String(payload.email).toLowerCase();
            console.log("[PROFILE] Using JWT cookie:", userEmail);
          }
        } catch (error) {
          console.error("[PROFILE] Invalid JWT:", error);
        }
      }
    }

    // If no valid session/email
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // 3. Fetch user by email (correct method)
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        image: true,
        role: true,
        emailVerified: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.error("[PROFILE] User not found:", userEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        image: user.image,
        role: user.role,
        emailVerified: !!user.emailVerified,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PROFILE] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile. Please try again." },
      { status: 500 }
    );
  }
}
