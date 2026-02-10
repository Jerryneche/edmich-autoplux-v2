// lib/auth-api.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// IMPORTANT: Use JWT_SECRET first (for mobile tokens), fallback to NEXTAUTH_SECRET (for web)
// Mobile tokens are signed with JWT_SECRET, so we must verify with the same secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

// Log the secret length on startup (don't log the actual secret!)
console.log("[AUTH-API] JWT_SECRET length:", JWT_SECRET?.length || 0);

// Generate JWT token for mobile app
export function generateToken(
  userId: string,
  email: string,
  role: string,
): string {
  console.log("[AUTH-API] Generating token for:", userId, email, role);
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "30d" });
}

// Get authenticated user from either NextAuth session OR JWT token
export async function getAuthUser(req: NextRequest) {
  console.log("[AUTH-API] ========== getAuthUser START ==========");

  // Method 1: Check for Bearer token (mobile app)
  const authHeader = req.headers.get("authorization");
  console.log(
    "[AUTH-API] Auth header:",
    authHeader ? authHeader.substring(0, 30) + "..." : "NONE",
  );

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("[AUTH-API] Token length:", token.length);
    console.log("[AUTH-API] Token start:", token.substring(0, 20));

    try {
      console.log(
        "[AUTH-API] Attempting JWT verify with secret length:",
        JWT_SECRET?.length,
      );
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };
      console.log("[AUTH-API] ✅ Token decoded:", JSON.stringify(decoded));

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          supplierProfile: true,
          mechanicProfile: true,
          logisticsProfile: true,
        },
      });

      console.log("[AUTH-API] User found in DB:", !!user);
      if (user) {
        console.log("[AUTH-API] User ID:", user.id);
        console.log("[AUTH-API] User role:", user.role);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          image: user.image,
          role: user.role,
          isGoogleAuth: user.isGoogleAuth,
          hasPassword: user.hasPassword,
          onboardingStatus: user.onboardingStatus,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          supplierProfile: user.supplierProfile,
          mechanicProfile: user.mechanicProfile,
          logisticsProfile: user.logisticsProfile,
        };
      } else {
        console.log("[AUTH-API] ❌ User NOT found for userId:", decoded.userId);
      }
    } catch (error: any) {
      console.log("[AUTH-API] ❌ JWT verify FAILED:", error.message);
      console.log("[AUTH-API] Error name:", error.name);
    }
  } else {
    console.log("[AUTH-API] No Bearer token in header");
  }

  // Method 2: Check NextAuth session (web app)
  console.log("[AUTH-API] Trying NextAuth session...");
  try {
    const session = await getServerSession(authOptions);
    console.log("[AUTH-API] Session:", session ? "EXISTS" : "NONE");

    if (session?.user?.id) {
      console.log("[AUTH-API] Session user ID:", session.user.id);
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          supplierProfile: true,
          mechanicProfile: true,
          logisticsProfile: true,
        },
      });
      if (user) {
        console.log("[AUTH-API] ✅ User from session found");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          image: user.image,
          role: user.role,
          isGoogleAuth: user.isGoogleAuth,
          hasPassword: user.hasPassword,
          onboardingStatus: user.onboardingStatus,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          supplierProfile: user.supplierProfile,
          mechanicProfile: user.mechanicProfile,
          logisticsProfile: user.logisticsProfile,
        };
      }
    }
  } catch (error: any) {
    console.log("[AUTH-API] NextAuth error:", error.message);
  }

  console.log("[AUTH-API] === No user found, returning null ===");
  return null;
}
