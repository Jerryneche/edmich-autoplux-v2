import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const VALID_ROLES = ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS"] as const;
type UserRole = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
  try {
    let userEmail: string | null = null;

    // 1. Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase();
      console.log("[ROLE] Using NextAuth session:", userEmail);
    }

    // 2. Try OTP/email-confirmation cookie if NextAuth failed
    if (!userEmail) {
      const possibleCookies = [
        "session",
        "auth-token",
        "otp-session",
        "email-session",
        "tempUser",
      ];

      const foundCookieName = possibleCookies.find((name) =>
        req.cookies.get(name)
      );

      if (foundCookieName) {
        const token = req.cookies.get(foundCookieName)!.value;

        try {
          const { jwtVerify } = await import("jose");
          const secret = new TextEncoder().encode(
            process.env.NEXTAUTH_SECRET || ""
          );
          const { payload } = await jwtVerify(token, secret);

          if (payload.email) {
            userEmail = String(payload.email).toLowerCase();
            console.log("[ROLE] Using OTP/JWT cookie:", userEmail);
          }
        } catch (err) {
          console.error("[ROLE] JWT verification failed:", err);
        }
      }
    }

    // 3. If still no email → unauthorized
    if (!userEmail) {
      console.error("[ROLE] No authentication found");
      return NextResponse.json(
        { error: "Unauthorized. Please login" },
        { status: 401 }
      );
    }

    const { role } = await req.json();

    // Validate role
    if (!role || typeof role !== "string")
      return NextResponse.json({ error: "Role is required" }, { status: 400 });

    if (!VALID_ROLES.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // 4. Lookup user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.error("[ROLE] User not found:", userEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5. Update role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role as UserRole,
        hasCompletedOnboarding: true,
      },
    });

    console.log(`[ROLE] Updated user ${user.email} → ${role}`);

    return NextResponse.json(
      { message: "Role updated successfully", role },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ROLE] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
