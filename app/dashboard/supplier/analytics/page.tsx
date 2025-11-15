"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function SupplierAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && session?.user?.role !== "SUPPLIER") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-neutral-900 mb-8">
            Analytics
          </h1>

          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <ChartBarIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              Analytics Coming Soon
            </p>
            <p className="text-neutral-600">
              View sales reports and performance metrics
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
