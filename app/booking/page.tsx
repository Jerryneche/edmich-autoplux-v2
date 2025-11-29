"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function BookingPage() {
  const [bookingContext, setBookingContext] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ctx = sessionStorage.getItem("bookingContext");
      if (ctx) setBookingContext(JSON.parse(ctx));
    }
  }, []);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* BACK BUTTON */}
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Home
            </Link>
          </div>

          {/* AUTO BOOKING CONTEXT BANNER */}
          {bookingContext && (
            <div className="mb-8 bg-blue-100 border border-blue-300 p-4 rounded-xl text-center shadow-sm animate-pulse">
              <p className="text-blue-800 font-semibold">
                Booking linked to Order #{bookingContext.orderId}
              </p>
            </div>
          )}

          {/* PAGE HEADER */}
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight animate-fade-in">
              Book a Service
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto animate-fade-in-delay">
              Choose between fast, reliable logistics or trusted mechanic
              services — powered by EDMICH AUTOPLUX
            </p>
          </header>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAIN SERVICE SELECTION */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Quick Bookings
                </h2>
                <p className="text-gray-600 mb-6">
                  Pick a service to start a new booking. If you have an existing
                  order, EDMICH will automatically link it.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                  {/* LOGISTICS CARD */}
                  <Link
                    href="/booking/logistics"
                    className="group block rounded-2xl border border-gray-200 hover:shadow-xl transition p-6 bg-gradient-to-br from-white to-green-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-50 text-green-700 rounded-lg flex items-center justify-center">
                        <TruckIcon className="h-7 w-7" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Logistics Booking
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Arrange pickups, deliveries, and real-time tracking.
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Pickup & Delivery
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                            Estimated pricing
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow">
                        Start Logistics Booking
                      </button>
                    </div>
                  </Link>

                  {/* MECHANIC CARD */}
                  <Link
                    href="/booking/mechanic"
                    className="group block rounded-2xl border border-gray-200 hover:shadow-xl transition p-6 bg-gradient-to-br from-white to-blue-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
                        <WrenchScrewdriverIcon className="h-7 w-7" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mechanic Booking
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Book verified technicians for repairs & installations.
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            Certified Mechanics
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                            Calendar & Pricing
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow">
                        Book Mechanic
                      </button>
                    </div>
                  </Link>
                </div>
              </div>

              {/* STATIC INFO BANNER */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    📦
                  </div>

                  <div>
                    <p className="text-lg font-bold text-blue-900">
                      Link your booking to an order
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      If you started from an order, it auto-links.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Need help deciding?
                </h3>
                <p className="text-gray-600 mb-4">
                  Call support or explore available services.
                </p>

                <a
                  href="tel:+2349025579441"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Call Support
                </a>

                <div className="mt-6 border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Estimated Cost</p>
                  <p className="text-3xl font-bold text-green-600">₦0</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a service to calculate
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
