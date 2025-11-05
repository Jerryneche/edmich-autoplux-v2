"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = localStorage.getItem("hasSeenWelcomeModal");

    if (!hasSeenModal) {
      // Show modal after a short delay
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcomeModal", "true");
  };

  const handleOptionClick = () => {
    localStorage.setItem("hasSeenWelcomeModal", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const options = [
    {
      icon: ShoppingBagIcon,
      title: "Buy Auto Parts",
      description: "Browse 10,000+ genuine parts from verified suppliers",
      href: "/shop",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: BuildingStorefrontIcon,
      title: "Sell Auto Parts",
      description: "List your products and reach thousands of buyers",
      href: "/signup?role=SUPPLIER",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: WrenchScrewdriverIcon,
      title: "Find a Mechanic",
      description: "Book certified mechanics for repairs & maintenance",
      href: "/business/mechanics",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: TruckIcon,
      title: "Logistics Services",
      description: "Fast & reliable delivery across Nigeria",
      href: "/business/logistics",
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all z-10"
          >
            <XMarkIcon className="h-6 w-6 text-neutral-700" />
          </button>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-3xl bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                  EDMICH
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                Welcome! 👋
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                What brings you to Nigeria leading automotive marketplace today?
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {options.map((option, index) => (
                <Link
                  key={index}
                  href={option.href}
                  onClick={handleOptionClick}
                  className="group relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 border-2 border-neutral-200 hover:border-transparent hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                  ></div>

                  {/* Content */}
                  <div className="relative">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <option.icon className="h-7 w-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all shadow-lg">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center">
              <button
                onClick={handleClose}
                className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                I will explore on my own
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
