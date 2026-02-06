/**
 * Security utility functions for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url);
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return "";
    }
    return urlObj.toString();
  } catch {
    return "";
  }
}

/**
 * Validate phone number (basic)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(sanitizeString(phone));
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(
  body: any,
  allowedFields: string[]
): Record<string, any> {
  if (!body || typeof body !== "object") {
    return {};
  }

  const validated: Record<string, any> = {};

  for (const field of allowedFields) {
    if (field in body) {
      const value = body[field];

      if (typeof value === "string") {
        validated[field] = sanitizeString(value);
      } else if (typeof value === "number") {
        validated[field] = sanitizeNumber(value);
      } else if (typeof value === "boolean") {
        validated[field] = value;
      } else if (Array.isArray(value)) {
        validated[field] = value
          .filter((v) => typeof v === "string")
          .map((v) => sanitizeString(v));
      }
    }
  }

  return validated;
}

/**
 * Check if IP is in private range (for CSRF protection)
 */
export function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^127\./, // 127.0.0.0/8
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^::1$/, // IPv6 loopback
    /^fc/, // IPv6 private
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * Rate limiting key generator
 */
export function generateRateLimitKey(
  userId?: string,
  ip?: string,
  endpoint?: string
): string {
  const parts = [endpoint || "global"];
  if (userId) parts.push(`user:${userId}`);
  if (ip) parts.push(`ip:${ip}`);
  return `ratelimit:${parts.join(":")}`;
}
