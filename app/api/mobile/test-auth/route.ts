// app/api/mobile/test-auth/route.ts
// TEMPORARY - Delete after debugging
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const result: Record<string, any> = {
    step: "start",
    timestamp: new Date().toISOString(),
  };

  try {
    // Step 1: Check env
    result.env = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
        ? `YES (${process.env.NEXTAUTH_SECRET.length} chars)`
        : "NO",
      JWT_SECRET: process.env.JWT_SECRET
        ? `YES (${process.env.JWT_SECRET.length} chars)`
        : "NO",
    };
    result.step = "env_checked";

    // Step 2: Get header
    const authHeader = req.headers.get("authorization");
    result.authHeader = authHeader
      ? authHeader.substring(0, 50) + "..."
      : "MISSING";

    if (!authHeader) {
      result.error = "No Authorization header";
      return NextResponse.json(result);
    }
    result.step = "header_found";

    // Step 3: Extract token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    result.tokenLength = token.length;
    result.tokenPreview = token.substring(0, 30) + "...";
    result.step = "token_extracted";

    // Step 4: Decode (no verification)
    const decoded = jwt.decode(token);
    result.decoded = decoded;
    result.step = "token_decoded";

    // Step 5: Get secret
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      result.error = "No secret found in env";
      return NextResponse.json(result);
    }
    result.secretLength = secret.length;
    result.step = "secret_found";

    // Step 6: Verify token
    try {
      const verified = jwt.verify(token, secret);
      result.verified = verified;
      result.step = "token_verified";
    } catch (verifyError: any) {
      result.verifyError = {
        name: verifyError.name,
        message: verifyError.message,
      };
      result.step = "verify_failed";
      return NextResponse.json(result);
    }

    // Step 7: Extract userId
    const payload = result.verified as any;
    const userId = payload.userId || payload.id || payload.sub;
    result.extractedUserId = userId;
    result.step = "userId_extracted";

    if (!userId) {
      result.error = "No userId in token payload";
      return NextResponse.json(result);
    }

    // Step 8: Find user in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    result.userFound = !!user;
    result.user = user;
    result.step = user ? "SUCCESS" : "user_not_found";

    return NextResponse.json(result);
  } catch (error: any) {
    result.fatalError = error.message;
    return NextResponse.json(result, { status: 500 });
  }
}

// Also support POST for testing
export async function POST(req: NextRequest) {
  return GET(req);
}
