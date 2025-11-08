import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "BUYER" | "SUPPLIER" | "ADMIN" | "MECHANIC" | "LOGISTICS";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "BUYER" | "SUPPLIER" | "ADMIN" | "MECHANIC" | "LOGISTICS";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "BUYER" | "SUPPLIER" | "ADMIN" | "MECHANIC" | "LOGISTICS";
  }
}
