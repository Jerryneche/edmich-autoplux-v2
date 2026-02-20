// lib/auth.ts - FIXED VERSION WITH ACCOUNT LINKING
declare module "bcryptjs";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

type UserRole = "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      // ✅ CRITICAL: Allow account linking
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: {
          label: "Email or Username",
          type: "text",
          placeholder: "email@example.com or username",
        },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        verified: { label: "Verified", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Please provide credentials");
        }

        // OTP LOGIN FLOW
        if (credentials.email) {
          console.log("[AUTH] Email-based login attempt:", credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              supplierProfile: true,
              mechanicProfile: true,
              logisticsProfile: true,
            },
          });

          if (!user) {
            throw new Error("Account not found");
          }

          if (!user.emailVerified) {
            throw new Error(
              "Email not verified. Please verify your email first.",
            );
          }

          if (credentials.verified === "true") {
            console.log(
              "[AUTH] Verified flag set, creating session for:",
              user.email,
            );
          } else if (credentials.otp) {
            console.log("[AUTH] OTP login successful:", user.email);
          } else {
            throw new Error("Invalid authentication method");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            onboardingStatus: user.onboardingStatus,
            isGoogleAuth: user.isGoogleAuth,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            hasSupplierProfile: !!user.supplierProfile,
            hasMechanicProfile: !!user.mechanicProfile,
            hasLogisticsProfile: !!user.logisticsProfile,
          } as any;
        }

        // PASSWORD LOGIN FLOW
        if (credentials.emailOrUsername && credentials.password) {
          console.log(
            "[AUTH] Password login attempt:",
            credentials.emailOrUsername,
          );

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.emailOrUsername.toLowerCase() },
                { username: credentials.emailOrUsername.toLowerCase() },
              ],
            },
            include: {
              supplierProfile: true,
              mechanicProfile: true,
              logisticsProfile: true,
            },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          console.log("[AUTH] Password login successful:", user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            onboardingStatus: user.onboardingStatus,
            isGoogleAuth: user.isGoogleAuth,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            hasSupplierProfile: !!user.supplierProfile,
            hasMechanicProfile: !!user.mechanicProfile,
            hasLogisticsProfile: !!user.logisticsProfile,
          } as any;
        }

        throw new Error("Invalid credentials");
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH-SIGNIN] Starting sign-in:", { provider: account?.provider, email: user.email });
      
      if (account?.provider === "credentials") return true;

      // ✅ IMPROVED GOOGLE SIGN IN HANDLER
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) {
          console.error("[AUTH-SIGNIN] No email from Google");
          return false;
        }

        try {
          console.log("[AUTH-SIGNIN] Looking for existing Google user:", email);
          const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!existingUser) {
            // New Google user - create account
            console.log("[AUTH-SIGNIN] Creating new Google user:", email);
            await prisma.user.create({
              data: {
                email: email.toLowerCase(),
                name: user.name || profile?.name || "User",
                image: user.image || profile?.image,
                emailVerified: new Date(),
                isGoogleAuth: true,
                hasCompletedOnboarding: false,
                role: "BUYER",
              },
            });
            console.log("[AUTH-SIGNIN] ✅ New Google user created:", email);
          } else {
            // Existing user - update and link Google account
            console.log("[AUTH-SIGNIN] Linking Google to existing user:", email);
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
                isGoogleAuth: true, // Mark as Google-linked
              },
            });
            console.log("[AUTH-SIGNIN] ✅ Existing user linked to Google:", email);
          }

          return true;
        } catch (error) {
          console.error("[AUTH-SIGNIN] ❌ Google sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session, account }) {
      console.log("[AUTH-JWT] JWT callback triggered:", { userId: user?.id, trigger, hasToken: !!token, accountProvider: account?.provider });
      
      try {
        // CRITICAL: Only fetch on initial sign-in, not every request
        if (user && !token.id) {
          console.log("[AUTH-JWT] Initial token creation for user:", user.id);
          
          try {
            type DBUser = {
              id: string;
              role: string | null;
              onboardingStatus: string | null;
              isGoogleAuth: boolean;
              hasCompletedOnboarding: boolean;
              supplierProfile: { id: string } | null;
              mechanicProfile: { id: string } | null;
              logisticsProfile: { id: string } | null;
            };

            // Set timeout for database query
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Database query timeout")), 5000)
            );
            
            const dbUserPromise = prisma.user.findUnique({
              where: { id: user.id },
              select: {
                id: true,
                role: true,
                onboardingStatus: true,
                isGoogleAuth: true,
                hasCompletedOnboarding: true,
                supplierProfile: { select: { id: true } },
                mechanicProfile: { select: { id: true } },
                logisticsProfile: { select: { id: true } },
              },
            }) as Promise<DBUser | null>;
            
            const dbUser = await Promise.race<DBUser | null>([dbUserPromise, timeoutPromise]);

            if (dbUser) {
              console.log("[AUTH-JWT] ✅ Initial token populated for:", user.id);
              token.id = dbUser.id;
              token.role = (dbUser.role ?? "BUYER") as UserRole;
              token.onboardingStatus = dbUser.onboardingStatus ?? "PENDING";
              token.isGoogleAuth = dbUser.isGoogleAuth ?? false;
              token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding ?? true;
              token.hasSupplierProfile = !!dbUser.supplierProfile;
              token.hasMechanicProfile = !!dbUser.mechanicProfile;
              token.hasLogisticsProfile = !!dbUser.logisticsProfile;
            } else {
              console.warn("[AUTH-JWT] ⚠️ User not found in database:", user.id);
              // Fallback: create full token to prevent auth loop
              token.id = user.id;
              token.role = "BUYER";
              token.onboardingStatus = "PENDING";
              token.isGoogleAuth = false;
              token.hasCompletedOnboarding = false;
              token.hasSupplierProfile = false;
              token.hasMechanicProfile = false;
              token.hasLogisticsProfile = false;
            }
                  const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database query timeout")), 5000)
                  );
                  try {
                    const dbUserPromise = prisma.user.findUnique({
                      where: { id: user.id },
                      select: {
                        id: true,
                        role: true,
                        onboardingStatus: true,
                        isGoogleAuth: true,
                        hasCompletedOnboarding: true,
                        supplierProfile: { select: { id: true } },
                        mechanicProfile: { select: { id: true } },
                        logisticsProfile: { select: { id: true } },
                      },
                    });
                    const dbUser = await Promise.race([dbUserPromise, timeoutPromise]);
                    if (dbUser) {
                      console.log("[AUTH-JWT] ✅ Initial token populated for:", user.id);
                      token.id = dbUser.id;
                      token.role = (dbUser.role ?? "BUYER") as UserRole;
                      token.onboardingStatus = dbUser.onboardingStatus ?? "PENDING";
                      token.isGoogleAuth = dbUser.isGoogleAuth ?? false;
                      token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding ?? true;
                      token.hasSupplierProfile = !!dbUser.supplierProfile;
                      token.hasMechanicProfile = !!dbUser.mechanicProfile;
                      token.hasLogisticsProfile = !!dbUser.logisticsProfile;
                    } else {
                      console.warn("[AUTH-JWT] ⚠️ User not found in database:", user.id);
                      // Fallback: create full token to prevent auth loop
                      token.id = user.id;
                      token.role = "BUYER";
                      token.onboardingStatus = "PENDING";
                      token.isGoogleAuth = false;
                      token.hasCompletedOnboarding = false;
                      token.hasSupplierProfile = false;
                      token.hasMechanicProfile = false;
                      token.hasLogisticsProfile = false;
                    }
                  } catch (queryError) {
                    console.warn("[AUTH-JWT] ⚠️ Database query timeout or error:", queryError);
                    // Fallback: create full token to prevent auth loop
                    token.id = user.id;
                    token.role = "BUYER";
                    token.onboardingStatus = "PENDING";
                    token.isGoogleAuth = false;
                    token.hasCompletedOnboarding = false;
                    token.hasSupplierProfile = false;
                    token.hasMechanicProfile = false;
                    token.hasLogisticsProfile = false;
                  }
                  console.log("[AUTH-JWT] ✅ JWT callback completed - returning token");
                  return token;
                }
            }
          } catch (queryError) {
            console.warn("[AUTH-JWT] ⚠️ Token refresh timeout/error:", queryError);
            // Keep existing token on timeout
          }
        }

        return token;
      } catch (error) {
        console.error("[AUTH-JWT] ❌ JWT callback error:", error);
        // Return existing token to prevent auth loop on error
        return token;
      }
    },

    async session({ session, token }) {
      console.log("[AUTH-SESSION] Session callback triggered");
      
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = (token.role || "BUYER") as any;
          session.user.onboardingStatus = (token.onboardingStatus ||
            "PENDING") as string;
          session.user.isGoogleAuth = token.isGoogleAuth as boolean;
          session.user.hasCompletedOnboarding =
            token.hasCompletedOnboarding as boolean;

          if (token.hasSupplierProfile !== undefined) {
            session.user.hasSupplierProfile = token.hasSupplierProfile;
          }
          if (token.hasMechanicProfile !== undefined) {
            session.user.hasMechanicProfile = token.hasMechanicProfile;
          }
          if (token.hasLogisticsProfile !== undefined) {
            session.user.hasLogisticsProfile = token.hasLogisticsProfile;
          }
        }
        console.log("[AUTH-SESSION] ✅ Session callback completed");
        return session;
      } catch (error) {
        console.error("[AUTH-SESSION] ❌ Session callback error:", error);
        throw error;
      }
    },

    async redirect({ url, baseUrl }) {
      console.log("[AUTH-REDIRECT] Redirecting:", { url, baseUrl });
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log("[AUTH-REDIRECT] ✅ Relative URL redirect:", redirectUrl);
        return redirectUrl;
      }

      // Handle full URLs from our domain
      if (url.startsWith(baseUrl)) {
        console.log("[AUTH-REDIRECT] ✅ Same domain redirect:", url);
        return url;
      }

      // Default redirect after sign-in
      const defaultUrl = `${baseUrl}/dashboard`;
      console.log("[AUTH-REDIRECT] ✅ Default redirect:", defaultUrl);
      return defaultUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // ✅ Redirect errors to login page
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
