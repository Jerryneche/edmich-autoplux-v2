"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleSelectionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // If user already has a role → skip this page
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.replace("/dashboard"); // or "/" or wherever you want
    }
  }, [session, status, router]);

  const selectRole = async (role: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google-role-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to save role");

      // Force session update + redirect
      await update();
      router.replace("/dashboard");
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to EDMICH
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            How will you use EDMICH AutoPlux?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => selectRole("BUYER")}
            disabled={isLoading}
            className="p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all border-2 border-blue-200"
          >
            <div className="text-6xl mb-4">Shopping Cart</div>
            <h3 className="text-2xl font-bold text-blue-600">I'm a Buyer</h3>
            <p className="text-gray-600 mt-2">Shop for parts, track orders</p>
          </button>

          <button
            onClick={() => selectRole("SUPPLIER")}
            disabled={isLoading}
            className="p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all border-2 border-purple-200"
          >
            <div className="text-6xl mb-4">Warehouse</div>
            <h3 className="text-2xl font-bold text-purple-600">
              I'm a Supplier
            </h3>
            <p className="text-gray-600 mt-2">
              List products, manage inventory
            </p>
          </button>

          <button
            onClick={() => selectRole("MECHANIC")}
            disabled={isLoading}
            className="p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all border-2 border-green-200"
          >
            <div className="text-6xl mb-4">Tools</div>
            <h3 className="text-2xl font-bold text-green-600">
              I'm a Mechanic
            </h3>
            <p className="text-gray-600 mt-2">Find jobs, manage bookings</p>
          </button>

          <button
            onClick={() => selectRole("LOGISTICS")}
            disabled={isLoading}
            className="p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all border-2 border-orange-200"
          >
            <div className="text-6xl mb-4">Truck</div>
            <h3 className="text-2xl font-bold text-orange-600">
              Logistics Partner
            </h3>
            <p className="text-gray-600 mt-2">Handle deliveries & tracking</p>
          </button>
        </div>

        <p className="text-sm text-gray-500">
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}
