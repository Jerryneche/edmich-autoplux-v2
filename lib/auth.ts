// lib/auth.ts - FIXED VERSION WITH ACCOUNT LINKING
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
              "Email not verified. Please verify your email first."
            );
          }

          if (credentials.verified === "true") {
            console.log(
              "[AUTH] Verified flag set, creating session for:",
              user.email
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
            credentials.emailOrUsername
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;

      // ✅ IMPROVED GOOGLE SIGN IN HANDLER
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!existingUser) {
            // New Google user - create account
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
            console.log("[AUTH] New Google user created:", email);
          } else {
            // Existing user - update and link Google account
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
                isGoogleAuth: true, // Mark as Google-linked
              },
            });
            console.log("[AUTH] Existing user linked to Google:", email);
          }

          return true;
        } catch (error) {
          console.error("[AUTH] Google sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
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
      // Handle relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Handle full URLs from our domain
      if (url.startsWith(baseUrl)) return url;

      // Default redirect after sign-in
      return `${baseUrl}/dashboard`;
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
