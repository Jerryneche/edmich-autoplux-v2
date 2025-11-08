// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    async signIn({ user, account, profile }) {
      if (account?.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // New OAuth user → create with default role
        if (!dbUser) {
          // Prisma Adapter will create user, but we patch role
          // This runs AFTER adapter creates user
          setImmediate(async () => {
            await prisma.user.update({
              where: { email: user.email! },
              data: { role: "BUYER", onboardingStatus: "PENDING" },
            });
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "BUYER";
        token.onboardingStatus = user.onboardingStatus ?? "PENDING";
      }

      // Update session
      if (trigger === "update" && session) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          token.role = dbUser.role ?? "BUYER";
          token.onboardingStatus = dbUser.onboardingStatus ?? "PENDING";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingStatus = token.onboardingStatus as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // After sign in
      if (url.startsWith(baseUrl)) {
        const redirectTo = new URL(url, baseUrl);
        const session = await import("next-auth/next").then(
          (mod) => mod.getServerSession
        );
        // This won't work in callback, so we handle in middleware
        return url;
      }
      return baseUrl;
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
