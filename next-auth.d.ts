/// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      onboardingStatus: string;
      isGoogleAuth: boolean;
      hasCompletedOnboarding: boolean;
      hasSupplierProfile?: boolean;
      hasMechanicProfile?: boolean;
      hasLogisticsProfile?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    onboardingStatus?: string;
    isGoogleAuth?: boolean;
    hasCompletedOnboarding?: boolean;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    onboardingStatus: string;
    isGoogleAuth: boolean;
    hasCompletedOnboarding: boolean;
    hasSupplierProfile?: boolean;
    hasMechanicProfile?: boolean;
    hasLogisticsProfile?: boolean;
  }
}

// types/next-auth.d.ts - UPDATE YOUR TYPES FILE
