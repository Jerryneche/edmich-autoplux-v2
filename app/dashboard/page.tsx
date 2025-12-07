"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user has JWT session from simplified signup
        const response = await fetch("/api/user/profile");

        if (response.ok) {
          const user = await response.json();

          // Redirect based on role
          switch (user.role) {
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
        } else {
          // No valid session, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
