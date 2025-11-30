"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const bookingTypes = [
    {
      title: "Mechanic Services",
      description: "Book mechanics for repairs and maintenance",
      icon: WrenchScrewdriverIcon,
      href: "/dashboard/buyer/bookings?type=mechanics",
      color: "purple",
      stats: "View all your mechanic bookings",
    },
    {
      title: "Logistics & Delivery",
      description: "Track your delivery and logistics bookings",
      icon: TruckIcon,
      href: "/dashboard/buyer/bookings?type=logistics",
      color: "green",
      stats: "Manage your deliveries",
    },
  ];

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            My{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bookings
            </span>
          </h1>
          <p className="text-lg text-neutral-600">
            Manage all your service bookings in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {bookingTypes.map((type) => (
            <Link
              key={type.title}
              href={type.href}
              className="group bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-xl transition-all p-8"
            >
              <div
                className={`w-16 h-16 bg-${type.color}-100 rounded-xl flex items-center justify-center mb-6`}
              >
                <type.icon className={`h-8 w-8 text-${type.color}-600`} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                {type.title}
              </h2>

              <p className="text-neutral-600 mb-4">{type.description}</p>

              <p className="text-sm text-neutral-500">{type.stats}</p>

              <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold">
                View Bookings
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <CalendarIcon className="h-10 w-10 text-blue-600" />
            <h3 className="text-2xl font-bold text-neutral-900">
              Need a New Booking?
            </h3>
          </div>
          <p className="text-neutral-700 mb-6">
            Book mechanics or logistics services for your vehicle needs
          </p>
          <div className="flex gap-4">
            <Link
              href="/mechanics/find"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Book Mechanic
            </Link>
            <Link
              href="/logistics/find"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Book Delivery
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
