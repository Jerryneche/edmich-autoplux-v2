import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
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
        if (!credentials?.email || !credentials?.password)
          throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) throw new Error("Invalid credentials");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          onboardingStatus: user.onboardingStatus,
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

      if (!dbUser.role) {
        setImmediate(async () => {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { role: "BUYER", onboardingStatus: "PENDING" },
          });
        });
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.role = (user.role ?? "BUYER") as UserRole;
        token.onboardingStatus = user.onboardingStatus ?? "PENDING";

        // 🔥 Check for supplier profile on initial login
        if (user.role === "SUPPLIER") {
          const supplierProfile = await prisma.supplierProfile.findUnique({
            where: { userId: user.id },
          });
          token.hasSupplierProfile = !!supplierProfile;
        }

        // 🔥 Check for mechanic profile on initial login
        if (user.role === "MECHANIC") {
          const mechanicProfile = await prisma.mechanicProfile.findUnique({
            where: { userId: user.id },
          });
          token.hasMechanicProfile = !!mechanicProfile;
        }

        // 🔥 Check for logistics profile on initial login
        if (user.role === "LOGISTICS") {
          const logisticsProfile = await prisma.logisticsProfile.findUnique({
            where: { userId: user.id },
          });
          token.hasLogisticsProfile = !!logisticsProfile;
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

          // 🔥 Update supplier profile status
          if (refreshedUser.role === "SUPPLIER") {
            token.hasSupplierProfile = !!refreshedUser.supplierProfile;
          }

          // 🔥 Update mechanic profile status
          if (refreshedUser.role === "MECHANIC") {
            token.hasMechanicProfile = !!refreshedUser.mechanicProfile;
          }

          // 🔥 Update logistics profile status
          if (refreshedUser.role === "LOGISTICS") {
            token.hasLogisticsProfile = !!refreshedUser.logisticsProfile;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.onboardingStatus = token.onboardingStatus as string;

        // 🔥 Add supplier profile status to session
        if (token.role === "SUPPLIER") {
          session.user.hasSupplierProfile = token.hasSupplierProfile as boolean;
        }

        // 🔥 Add mechanic profile status to session
        if (token.role === "MECHANIC") {
          session.user.hasMechanicProfile = token.hasMechanicProfile as boolean;
        }

        // 🔥 Add logistics profile status to session
        if (token.role === "LOGISTICS") {
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
