"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import WelcomeModal from "./components/WelcomeModal";
import { ShieldCheck, Truck, Wrench, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <WelcomeModal />
      <Header />

      <main className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden relative">
        {/* Decorative left gradient rail */}
        <div className="absolute top-0 left-0 h-full w-[6px] bg-gradient-to-b from-blue-600 via-purple-500 to-indigo-600 shadow-lg shadow-blue-200/40" />

        {/* Ambient background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50 opacity-95" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
          {/* Motion glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-purple-200/40 rounded-full blur-3xl animate-pulse [animation-delay:700ms]" />

          <div className="relative z-10 max-w-6xl">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-700 rounded-full font-medium text-sm shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Driving Nigeria Forward</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent animate-gradient-x drop-shadow-sm">
              EDMICH AUTOPLUX
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Nigeria’s First B2B auto parts network
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/business/market"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
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
        </section>

        {/* Value Proposition */}
        <section className="relative py-32 px-6 bg-gradient-to-tr from-white via-blue-50/40 to-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-3xl opacity-30" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                Built for <span className="text-blue-600">Nigeria</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Designed for scale, speed, and trust.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Suppliers",
                  desc: "Every supplier goes through a strict verification process before going live.",
                  color: "from-blue-500 to-blue-700",
                },
                {
                  icon: Truck,
                  title: "Smart Logistics",
                  desc: "Track shipments in real-time, from port to workshop.",
                  color: "from-green-500 to-emerald-700",
                },
                {
                  icon: Wrench,
                  title: "Connected Mechanics",
                  desc: "Skilled professionals ready to install or diagnose anytime.",
                  color: "from-orange-500 to-red-600",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative p-8 bg-white rounded-3xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-6 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-repeat" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
              Be Part of the Movement
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Join the network that’s redefining how Nigeria moves, repairs, and
              grows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-blue-700 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Get Started
              </Link>
              <a
                href="https://wa.me/2349025579441"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
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
