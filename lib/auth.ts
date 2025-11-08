// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Define role type matching Prisma enum
type UserRole = "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

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
      // For OAuth users: ensure default role & onboarding status
      if (account?.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) {
          // Adapter creates user → we update role & onboarding
          setImmediate(async () => {
            try {
              await prisma.user.update({
                where: { email: user.email! },
                data: {
                  role: "BUYER",
                  onboardingStatus: "PENDING",
                },
              });
            } catch (error) {
              console.error("Failed to set default role/onboarding:", error);
            }
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const dbUser = user as any; // NextAuth doesn't know our custom fields

      // Initial sign-in
      if (dbUser) {
        token.id = dbUser.id;
        token.role = (dbUser.role ?? "BUYER") as UserRole;
        token.onboardingStatus = dbUser.onboardingStatus ?? "PENDING";
      }

      // Session update (e.g. after profile completion)
      if (trigger === "update" && session) {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (refreshedUser) {
          token.role = (refreshedUser.role ?? "BUYER") as UserRole;
          token.onboardingStatus = refreshedUser.onboardingStatus ?? "PENDING";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.onboardingStatus = token.onboardingStatus as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Let middleware handle onboarding redirects
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
