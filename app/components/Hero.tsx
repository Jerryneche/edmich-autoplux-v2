"use client";
import Link from "next/link";

import {
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  image: string;
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export default function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: Props) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background image with parallax effect */}
      <div className="absolute inset-0"></div>

      {/* Multi-layer gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20" />

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
          <SparklesIcon className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white/90">
            Nigeria&apos;s Leading Auto Parts Marketplace
          </span>
        </div>

        {/* Title with gradient text */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-100">
          {" "}
          <span className="block text-white drop-shadow-2xl leading-tight">
            {title ? title.split(" ").slice(0, -2).join(" ") : ""}
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
            {title ? title.split(" ").slice(-2).join(" ") : ""}
          </span>
        </h1>

        {subtitle && (
          <p className="mt-6 max-w-3xl text-xl md:text-2xl font-medium text-white/90 drop-shadow-lg leading-relaxed animate-fade-in-up animation-delay-200">
            {subtitle}
          </p>
        )}

        {/* CTAs with enhanced styling */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-4 text-base font-semibold text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative">{primaryCta.label}</span>
              <ArrowRightIcon className="relative h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-10 py-4 text-base font-semibold text-white shadow-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              <InformationCircleIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              {secondaryCta.label}
            </Link>
          )}
        </div>

        {/* Stats or trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80 animate-fade-in-up animation-delay-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              1000+ Verified Suppliers
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-100"></div>
            <span className="text-sm font-medium">
              Fast Nationwide Delivery
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-200"></div>
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Scroll to explore
            </span>
            <ChevronDownIcon className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slow-zoom {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </section>
  );
}
