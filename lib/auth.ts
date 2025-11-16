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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "BUYER",
          onboardingStatus: user.onboardingStatus || "PENDING",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      const email = user.email;
      if (!email) return true;

      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) return true;

      // Set default role if not set
      if (!dbUser.role) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: "BUYER", onboardingStatus: "PENDING" },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || "BUYER";
        token.onboardingStatus = user.onboardingStatus || "PENDING";
      }

      // Always fetch fresh profile data
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          include: {
            supplierProfile: true,
            mechanicProfile: true,
            logisticsProfile: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role || "BUYER";
          token.onboardingStatus = dbUser.onboardingStatus || "PENDING";
          token.hasSupplierProfile = dbUser.supplierProfile !== null;
          token.hasMechanicProfile = dbUser.mechanicProfile !== null;
          token.hasLogisticsProfile = dbUser.logisticsProfile !== null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingStatus = token.onboardingStatus as string;

        // Add profile flags if they exist
        if (token.hasSupplierProfile !== undefined) {
          session.user.hasSupplierProfile = token.hasSupplierProfile as boolean;
        }
        if (token.hasMechanicProfile !== undefined) {
          session.user.hasMechanicProfile = token.hasMechanicProfile as boolean;
        }
        if (token.hasLogisticsProfile !== undefined) {
          session.user.hasLogisticsProfile =
            token.hasLogisticsProfile as boolean;
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
