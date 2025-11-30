"use client";

import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

export default function ServicesPage() {
  const router = useRouter();

  const services = [
    {
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      title: "Parts Marketplace",
      description:
        "Browse and purchase authentic automotive parts from verified suppliers",
      color: "from-blue-500 to-blue-600",
      features: [
        "Wide selection of parts",
        "Verified suppliers",
        "Price comparison",
        "Fast delivery",
      ],
      action: () => router.push("/products"),
    },
    {
      icon: <WrenchScrewdriverIcon className="h-8 w-8" />,
      title: "Mechanic Services",
      description:
        "Find certified mechanics for repairs, maintenance, and installations",
      color: "from-green-500 to-green-600",
      features: [
        "Certified professionals",
        "Book appointments",
        "Mobile service available",
        "Transparent pricing",
      ],
      action: () => router.push("/mechanics"),
    },
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: "Logistics & Delivery",
      description:
        "Fast and reliable delivery services for your automotive needs",
      color: "from-orange-500 to-orange-600",
      features: [
        "Real-time tracking",
        "Multiple vehicle types",
        "Flexible scheduling",
        "Competitive rates",
      ],
      action: () => router.push("/logistics"),
    },
  ];

  const additionalServices = [
    {
      icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
      title: "My Bookings",
      description: "Manage all your service appointments",
      action: () => router.push("/bookings"),
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      title: "Chat Support",
      description: "Connect with suppliers and mechanics",
      action: () => router.push("/chat"),
    },
    {
      icon: <BellAlertIcon className="h-6 w-6" />,
      title: "Service Reminders",
      description: "Never miss a maintenance schedule",
      action: () => router.push("/vehicles"),
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your automotive requirements - all in one
              platform
            </p>
          </div>

          {/* Main Services */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div
                  className={`bg-gradient-to-r ${service.color} p-6 text-white`}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-white/90">{service.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={service.action}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Explore Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Services */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Additional Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <button
                  key={index}
                  onClick={service.action}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition text-left"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Choosing a Service?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Our support team is here to help you find the perfect solution
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/chat")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium"
              >
                Chat with Us
              </button>
              <button
                onClick={() => (window.location.href = "tel:+2341234567890")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
