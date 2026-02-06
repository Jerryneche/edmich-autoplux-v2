/**
 * API Security Middleware for Next.js API Routes
 */

import { NextRequest, NextResponse } from "next/server";
import { isPrivateIP } from "./security";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Rate limiting middleware
 */
export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 1 minute)
  maxRequests?: number; // Maximum requests per window (default: 100)
  keyGenerator?: (req: NextRequest) => string;
}

export async function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 100;

  return async (req: NextRequest) => {
    const key =
      options.keyGenerator?.(req) ||
      `${req.ip || "unknown"}:${req.nextUrl.pathname}`;

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    }

    return handler(req);
  };
}

/**
 * CORS security middleware
 */
export interface CORSOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function withCORS(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CORSOptions = {}
) {
  const allowedOrigins = options.allowedOrigins || [
    "https://www.edmich.com",
    "https://edmich.com",
  ];
  const allowedMethods = options.allowedMethods || [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ];
  const allowedHeaders = options.allowedHeaders || [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ];
  const credentials = options.credentials !== false;
  const maxAge = options.maxAge || 3600;

  return async (req: NextRequest) => {
    const origin = req.headers.get("origin");
    const isOriginAllowed = origin && allowedOrigins.includes(origin);

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          ...(isOriginAllowed && { "Access-Control-Allow-Origin": origin }),
          "Access-Control-Allow-Methods": allowedMethods.join(", "),
          "Access-Control-Allow-Headers": allowedHeaders.join(", "),
          "Access-Control-Max-Age": maxAge.toString(),
          ...(credentials && {
            "Access-Control-Allow-Credentials": "true",
          }),
        },
      });
    }

    const response = await handler(req);

    if (isOriginAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      if (credentials) {
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }
    }

    return response;
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const response = await handler(req);

    // Prevent MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "SAMEORIGIN");

    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  };
}

/**
 * Authentication middleware
 */
export async function withAuth(
  handler: (req: NextRequest, userId?: string) => Promise<NextResponse>,
  options: { optional?: boolean } = {}
) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token && !options.optional) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Note: Actual token validation should be done with your auth provider
    // This is a placeholder - implement with NextAuth session validation
    return handler(req, undefined);
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(
  ...middlewares: Array<
    (handler: (req: NextRequest) => Promise<NextResponse>) => (
      req: NextRequest
    ) => Promise<NextResponse>
  >
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    let composed = handler;
    for (const middleware of middlewares.reverse()) {
      composed = middleware(composed);
    }
    return composed;
  };
}

/**
 * Log security events
 */
export function logSecurityEvent(
  type: string,
  details: Record<string, any>
) {
  if (process.env.NODE_ENV === "production") {
    // Send to logging service (e.g., Sentry, LogRocket)
    console.warn(`[SECURITY] ${type}:`, details);
  } else {
    console.log(`[SECURITY] ${type}:`, details);
  }
}
