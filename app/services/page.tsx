// FILE 2: app/services/page.tsx - MAIN SERVICES PAGE
// ==========================================
"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function ServicesPage() {
  const services = [
    {
      title: "Find Mechanics",
      description:
        "Book professional mechanics for all your vehicle repair needs",
      icon: WrenchScrewdriverIcon,
      href: "/mechanics/find",
      color: "purple",
      features: [
        "Verified Professionals",
        "Competitive Rates",
        "24/7 Availability",
        "Quality Guarantee",
      ],
    },
    {
      title: "Logistics Services",
      description: "Reliable delivery and transportation across Nigeria",
      icon: TruckIcon,
      href: "/logistics/find",
      color: "green",
      features: [
        "Fast Delivery",
        "Real-time Tracking",
        "Nationwide Coverage",
        "Secure Transport",
      ],
    },
    {
      title: "Shop Auto Parts",
      description: "Browse thousands of genuine parts from verified suppliers",
      icon: ShoppingBagIcon,
      href: "/shop",
      color: "blue",
      features: [
        "Genuine Parts",
        "Verified Suppliers",
        "Best Prices",
        "Easy Returns",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <section className="pt-32 pb-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Everything you need for your vehicle - mechanics, parts, and
            delivery - all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-2xl transition-all p-8"
            >
              <div
                className={`w-16 h-16 bg-${service.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <service.icon className={`h-8 w-8 text-${service.color}-600`} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h2>

              <p className="text-neutral-600 mb-6">{service.description}</p>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-neutral-700"
                  >
                    <span
                      className={`w-1.5 h-1.5 bg-${service.color}-600 rounded-full`}
                    ></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                Explore Now
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
