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
  // Method 1: Check for Bearer token (mobile app)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          supplierProfile: true,
          mechanicProfile: true,
          logisticsProfile: true,
        },
      });
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
    } catch (error) {
      console.log("[AUTH-API] Invalid JWT token");
    }
  }

  // Method 2: Check NextAuth session (web app)
  try {
    const session = await getServerSession(authOptions);
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
  } catch (error) {
    console.log("[AUTH-API] No NextAuth session");
  }

  return null;
}
