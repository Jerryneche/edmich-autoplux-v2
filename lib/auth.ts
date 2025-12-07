// lib/auth.ts - COMPLETE UPDATED VERSION WITH OTP SUPPORT
declare module "bcryptjs";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type UserRole = "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ✅ GOOGLE PROVIDER
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
    }),

    // ✅ CREDENTIALS PROVIDER - Supports both PASSWORD and OTP login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        // Password login fields
        emailOrUsername: {
          label: "Email or Username",
          type: "text",
          placeholder: "email@example.com or username",
        },
        password: { label: "Password", type: "password" },
        // OTP login fields
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        // Verified flag (for post-role-selection session creation)
        verified: { label: "Verified", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Please provide credentials");
        }

        // ===============================
        // OTP LOGIN FLOW or POST-ROLE-SELECTION
        // ===============================
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

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error(
              "Email not verified. Please verify your email first."
            );
          }

          // If "verified" flag is set, skip OTP check (post-role-selection)
          if (credentials.verified === "true") {
            console.log(
              "[AUTH] Verified flag set, creating session for:",
              user.email
            );
          } else if (credentials.otp) {
            // OTP verification happens in verify-otp endpoint
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

        // ===============================
        // PASSWORD LOGIN FLOW (Existing)
        // ===============================
        if (credentials.emailOrUsername && credentials.password) {
          console.log(
            "[AUTH] Password login attempt:",
            credentials.emailOrUsername
          );

          // Find user by EMAIL OR USERNAME
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

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
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
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      // Handle Google Sign In
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return true;

        const dbUser = await prisma.user.findUnique({ where: { email } });

        if (!dbUser) {
          // New Google user - create with default role
          await prisma.user.create({
            data: {
              email: email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(), // Auto-verify Google users
              isGoogleAuth: true,
              hasCompletedOnboarding: false, // Needs role selection
              role: "BUYER", // Default
            },
          });
        } else {
          // Existing user - update image and verify email
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              image: user.image,
              emailVerified: new Date(),
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            supplierProfile: true,
            mechanicProfile: true,
            logisticsProfile: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = (dbUser.role ?? "BUYER") as UserRole;
          token.onboardingStatus = dbUser.onboardingStatus ?? "PENDING";
          token.isGoogleAuth = dbUser.isGoogleAuth ?? false;
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding ?? true;

          // Profile checks
          if (dbUser.role === "SUPPLIER") {
            token.hasSupplierProfile = !!dbUser.supplierProfile;
          }
          if (dbUser.role === "MECHANIC") {
            token.hasMechanicProfile = !!dbUser.mechanicProfile;
          }
          if (dbUser.role === "LOGISTICS") {
            token.hasLogisticsProfile = !!dbUser.logisticsProfile;
          }
        }
      }

      // Explicit refresh or update
      if (trigger === "update" || session) {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            supplierProfile: true,
            mechanicProfile: true,
            logisticsProfile: true,
          },
        });

        if (refreshedUser) {
          token.role = (refreshedUser.role ?? "BUYER") as UserRole;
          token.onboardingStatus = refreshedUser.onboardingStatus ?? "PENDING";
          token.hasCompletedOnboarding =
            refreshedUser.hasCompletedOnboarding ?? true;

          // Update profile status
          if (refreshedUser.role === "SUPPLIER") {
            token.hasSupplierProfile = !!refreshedUser.supplierProfile;
          }
          if (refreshedUser.role === "MECHANIC") {
            token.hasMechanicProfile = !!refreshedUser.mechanicProfile;
          }
          if (refreshedUser.role === "LOGISTICS") {
            token.hasLogisticsProfile = !!refreshedUser.logisticsProfile;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role || "BUYER") as any;
        session.user.onboardingStatus = (token.onboardingStatus ||
          "PENDING") as string;
        session.user.isGoogleAuth = token.isGoogleAuth as boolean;
        session.user.hasCompletedOnboarding =
          token.hasCompletedOnboarding as boolean;

        // Add profile flags
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
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handles relative URLs like "/dashboard"
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Handles full URLs from our domain
      if (url.startsWith(baseUrl)) return url;

      // Default: after sign-in, send to dashboard
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
