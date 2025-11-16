// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    onboardingStatus?: string;
    password?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      onboardingStatus: string;
      hasSupplierProfile?: boolean;
      hasMechanicProfile?: boolean;
      hasLogisticsProfile?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    onboardingStatus: string;
    hasSupplierProfile?: boolean;
    hasMechanicProfile?: boolean;
    hasLogisticsProfile?: boolean;
  }
}
