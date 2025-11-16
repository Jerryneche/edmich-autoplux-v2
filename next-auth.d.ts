/// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      onboardingStatus: string;
      hasSupplierProfile?: boolean;
      hasMechanicProfile?: boolean;
      hasLogisticsProfile?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    onboardingStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    onboardingStatus?: string;
    hasSupplierProfile?: boolean;
    hasMechanicProfile?: boolean;
    hasLogisticsProfile?: boolean;
  }
}
