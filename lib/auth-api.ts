// lib/auth-api.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;

// Generate JWT token for mobile app
export function generateToken(
  userId: string,
  email: string,
  role: string
): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "30d" });
}

// Get authenticated user from either NextAuth session OR JWT token
export async function getAuthUser(req: NextRequest) {
  console.log("[AUTH-API] === Starting getAuthUser ===");

  // Method 1: Check for Bearer token (mobile app)
  const authHeader = req.headers.get("authorization");
  console.log("[AUTH-API] Auth header exists:", !!authHeader);
  console.log("[AUTH-API] Auth header:", authHeader?.substring(0, 50) + "...");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("[AUTH-API] Token extracted, length:", token.length);

    try {
      console.log("[AUTH-API] JWT_SECRET exists:", !!JWT_SECRET);
      console.log("[AUTH-API] JWT_SECRET length:", JWT_SECRET?.length);

      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };
      console.log(
        "[AUTH-API] Token decoded successfully:",
        JSON.stringify(decoded)
      );

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          supplierProfile: true,
          mechanicProfile: true,
          logisticsProfile: true,
        },
      });

      console.log("[AUTH-API] User found:", !!user);
      console.log("[AUTH-API] User role:", user?.role);

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          supplierProfile: user.supplierProfile,
          mechanicProfile: user.mechanicProfile,
          logisticsProfile: user.logisticsProfile,
        };
      }
    } catch (error: any) {
      console.log("[AUTH-API] JWT verification FAILED:", error.message);
    }
  }

  // Method 2: Check NextAuth session (web app)
  console.log("[AUTH-API] Trying NextAuth session...");
  try {
    const session = await getServerSession(authOptions);
    console.log("[AUTH-API] Session exists:", !!session);
    console.log("[AUTH-API] Session user id:", session?.user?.id);

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          supplierProfile: true,
          mechanicProfile: true,
          logisticsProfile: true,
        },
      });
      if (user) {
        console.log("[AUTH-API] User from session found");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          supplierProfile: user.supplierProfile,
          mechanicProfile: user.mechanicProfile,
          logisticsProfile: user.logisticsProfile,
        };
      }
    }
  } catch (error: any) {
    console.log("[AUTH-API] NextAuth session error:", error.message);
  }

  console.log("[AUTH-API] === No user found, returning null ===");
  return null;
}
