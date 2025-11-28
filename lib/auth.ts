// lib/auth.ts - COMPLETE UPDATED VERSION
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
    // ✅ GOOGLE PROVIDER (NO GITHUB!)
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

    // ✅ CREDENTIALS PROVIDER - Login with EMAIL OR USERNAME
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: {
          label: "Email or Username",
          type: "text",
          placeholder: "email@example.com or username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Please enter email/username and password");
        }

        // ✅ Find user by EMAIL OR USERNAME
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername.toLowerCase() },
              { username: credentials.emailOrUsername.toLowerCase() },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // ✅ Check if email is verified
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

        return user;
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
      return url.startsWith(baseUrl) ? url : baseUrl;
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
