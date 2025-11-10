// app/page.tsx
"use client";

import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import Footer from "@/app/components/Footer";
import WelcomeModal from "./components/WelcomeModal";
import { ShieldCheck, Truck, Wrench, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <WelcomeModal />
      <Header />

      <main className="min-h-screen bg-white text-gray-900 overflow-hidden">
        {/* Hero - Clean Nigerian Style */}
        <section className="relative h-screen flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Nigeria's Auto Future</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent animate-gradient-x">
              EDMICH AUTOPLUX
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              The <span className="font-bold text-blue-600">first</span> B2B
              auto parts platform built for Nigeria. Verified suppliers.
              Real-time logistics. Smart mechanics.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business/market"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-100 border-2 border-gray-200 text-gray-800 rounded-full font-bold text-lg hover:bg-gray-200 transition-all"
              >
                For Businesses
              </Link>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live in Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Abuja Coming Q1 2026</span>
              </div>
            </div>
          </div>

          {/* Floating Orbs - Subtle */}
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl animate-pulse opacity-60" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl animate-pulse opacity-60 [animation-delay:700ms]" />
        </section>

        {/* Value Proposition */}
        <section className="py-32 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                Built for <span className="text-blue-600">Nigeria</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                One platform. Three ecosystems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Suppliers",
                  desc: "Every part. Every seller. 100% verified.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Truck,
                  title: "Real-Time Logistics",
                  desc: "Track from warehouse to workshop.",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: Wrench,
                  title: "Smart Mechanics",
                  desc: "Book. Diagnose. Fix. Done.",
                  color: "from-orange-500 to-red-600",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Join the <span className="text-blue-600">Auto Revolution</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Be part of Nigeria's first unified auto ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Get Started Free
              </Link>
              <a
                href="https://wa.me/2349025579441"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gray-100 border-2 border-gray-200 text-gray-800 rounded-full font-bold text-lg hover:bg-gray-200 transition-all"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
