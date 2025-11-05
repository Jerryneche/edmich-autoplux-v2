// components/OnboardingRedirect.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OnboardingRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    switch (session.user.role) {
      case "SUPPLIER":
        router.push("/onboarding/supplier");
        break;
      case "MECHANIC":
        router.push("/onboarding/mechanic");
        break;
      case "LOGISTICS":
        router.push("/onboarding/logistics");
        break;
      case "BUYER":
        router.push("/dashboard");
        break;
      default:
        router.push("/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}
