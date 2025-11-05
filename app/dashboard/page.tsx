"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Redirect based on role
    switch (session.user.role) {
      case "SUPPLIER":
        router.push("/dashboard/supplier");
        break;
      case "MECHANIC":
        router.push("/dashboard/mechanic");
        break;
      case "LOGISTICS":
        router.push("/dashboard/logistics");
        break;
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
      case "BUYER":
        router.push("/dashboard/buyer");
        break;
      default:
        router.push("/dashboard/buyer");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
