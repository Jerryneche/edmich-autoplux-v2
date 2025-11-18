"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SmartCTA from "./components/SmartCTA";
import {
  ShieldCheck,
  Truck,
  Wrench,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
  Users,
  Package,
  CheckCircle,
  Star,
  BarChart3,
  Clock,
  Shield,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState({
    suppliers: 0,
    orders: 0,
    mechanics: 0,
    cities: 0,
  });

  // Animated counter effect
  useEffect(() => {
    const targets = {
      suppliers: 500,
      orders: 12000,
      mechanics: 350,
      cities: 15,
    };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    const current = { suppliers: 0, orders: 0, mechanics: 0, cities: 0 };

    const timer = setInterval(() => {
      let allReached = true;

      Object.keys(targets).forEach((key) => {
        const target = targets[key as keyof typeof targets];
        const curr = current[key as keyof typeof current];

        if (curr < target) {
          allReached = false;
          current[key as keyof typeof current] = Math.min(
            curr + Math.ceil(target / steps),
            target
          );
        }
      });

      setStats({ ...current });

      if (allReached) clearInterval(timer);
    }, increment);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: "Chidi Okafor",
      role: "Owner, AutoParts Lagos",
      image: "/testimonials/user1.jpg",
      content:
        "EDMICH transformed our business. We've increased sales by 300% and now serve customers across Nigeria effortlessly.",
      rating: 5,
    },
    {
      name: "Amina Bello",
      role: "Fleet Manager, TransLogistics",
      image: "/testimonials/user2.jpg",
      content:
        "The logistics tracking is game-changing. We reduced delivery times by 40% and our customers love the transparency.",
      rating: 5,
    },
    {
      name: "Tunde Adeyemi",
      role: "Master Mechanic, Victoria Island",
      image: "/testimonials/user3.jpg",
      content:
        "Finding quality parts used to take days. Now I get verified parts delivered same-day. My customers are happier than ever.",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Marketplace",
      desc: "Every supplier undergoes rigorous verification. Buy with confidence knowing you're getting genuine parts.",
      color: "from-blue-500 to-blue-700",
      stats: "99.8% satisfaction rate",
    },
    {
      icon: Zap,
      title: "Instant Fulfillment",
      desc: "AI-powered inventory management ensures parts are in stock and ready to ship within hours.",
      color: "from-purple-500 to-purple-700",
      stats: "2-hour avg. processing",
    },
    {
      icon: Truck,
      title: "Smart Logistics",
      desc: "Real-time tracking, multi-carrier optimization, and predictive delivery for maximum efficiency.",
      color: "from-green-500 to-emerald-700",
      stats: "98% on-time delivery",
    },
    {
      icon: Wrench,
      title: "Certified Mechanics",
      desc: "Connect with skilled professionals vetted through our comprehensive background and skills verification.",
      color: "from-orange-500 to-red-600",
      stats: "1,200+ certified pros",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      desc: "Deep insights into purchasing patterns, inventory optimization, and market trends to grow smarter.",
      color: "from-pink-500 to-rose-700",
      stats: "Real-time reporting",
    },
    {
      icon: Users,
      title: "B2B Network",
      desc: "Join Africa's largest automotive ecosystem. Collaborate, negotiate, and scale together.",
      color: "from-indigo-500 to-indigo-700",
      stats: "15,000+ active users",
    },
  ];

  const useCases = [
    {
      title: "For Suppliers",
      desc: "Expand your reach across Nigeria. Manage inventory, automate orders, and grow revenue.",
      benefits: [
        "Nationwide customer base",
        "Automated order processing",
        "Payment protection",
        "Marketing tools",
      ],
      cta: "Start Selling",
      link: "/signup?role=supplier",
      gradient: "from-blue-600 to-purple-600",
    },
    {
      title: "For Mechanics",
      desc: "Get more customers, manage bookings, and source parts faster than ever before.",
      benefits: [
        "Customer booking system",
        "Parts marketplace access",
        "Verified reputation badges",
        "Scheduling tools",
      ],
      cta: "Join Network",
      link: "/signup?role=mechanic",
      gradient: "from-orange-500 to-red-600",
    },
    {
      title: "For Logistics",
      desc: "Optimize routes, track fleets, and win more contracts with our B2B logistics platform.",
      benefits: [
        "Route optimization",
        "Fleet management",
        "Real-time tracking",
        "Contract marketplace",
      ],
      cta: "Get Started",
      link: "/signup?role=logistics",
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white text-gray-900 overflow-hidden">
        {/* Hero Section - Next Level */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          </div>

          {/* Floating elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping [animation-delay:0s]" />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-500 rounded-full animate-ping [animation-delay:1s]" />
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-green-500 rounded-full animate-ping [animation-delay:2s]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4" />
              <span>Powering Nigeria's Automotive Future</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                The Modern Nigeria's
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Automotive System
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
              Connect suppliers, mechanics, and logistics in one powerful
              platform. Source parts, manage services, and scale operations
              across Nigeria.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/business/market"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <SmartCTA className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-lg hover:border-gray-300 hover:shadow-lg transition-all">
                Start Free Trial
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  14 days
                </span>
              </SmartCTA>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                {
                  value: `${stats.suppliers}+`,
                  label: "Verified Suppliers",
                  icon: ShieldCheck,
                },
                {
                  value: `${(stats.orders / 1000).toFixed(1)}k+`,
                  label: "Orders Fulfilled",
                  icon: Package,
                },
                {
                  value: `${stats.mechanics}+`,
                  label: "Certified Mechanics",
                  icon: Wrench,
                },
                {
                  value: `${stats.cities}+`,
                  label: "Cities Served",
                  icon: Globe,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid - World-Class */}
        <section className="relative py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>Platform Features</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  dominate
                </span>{" "}
                your market
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built by industry experts, trusted by leading automotive
                businesses across Nigeria
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {feature.desc}
                    </p>

                    {/* Stats badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                      <TrendingUp className="w-3 h-3" />
                      {feature.stats}
                    </div>

                    {/* Hover effect gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 rounded-3xl transition-all duration-500 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases - Tailored Solutions */}
        <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-700 font-semibold mb-6">
                <Users className="w-4 h-4" />
                <span>Built For Everyone</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                Tailored solutions for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  your business
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're selling, servicing, or shipping - we've got you
                covered
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {useCases.map((useCase, i) => (
                <div
                  key={i}
                  className="group bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {useCase.desc}
                    </p>

                    {/* Benefits list */}
                    <ul className="space-y-3 mb-8">
                      {useCase.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <SmartCTA
                      href={useCase.link}
                      className={`group/btn inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r ${useCase.gradient} text-white rounded-xl font-bold hover:shadow-lg transition-all`}
                    >
                      {useCase.cta}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </SmartCTA>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof - Testimonials */}
        <section className="relative py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full text-yellow-700 font-semibold mb-6">
                <Star className="w-4 h-4 fill-current" />
                <span>Trusted by Industry Leaders</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                Don't just take our word for it
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See what our customers are saying about their experience
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 border-2 border-gray-100">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonials[activeTestimonial].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-yellow-400 fill-current"
                          />
                        )
                      )}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>

                    {/* Author */}
                    <div>
                      <div className="font-bold text-gray-900">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonials[activeTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeTestimonial
                          ? "w-8 bg-blue-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Shield, text: "SSL Secured", color: "text-green-600" },
                { icon: Clock, text: "24/7 Support", color: "text-blue-600" },
                {
                  icon: CheckCircle,
                  text: "99.9% Uptime",
                  color: "text-purple-600",
                },
                { icon: Users, text: "15k+ Users", color: "text-orange-600" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                  <span className="text-sm font-semibold text-gray-700">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Conversion Focused */}
        <section className="relative py-32 px-6 bg-gradient-to-br from-gray-400 via-blue-500 to-purple-300 text-white overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Ready to transform your business?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join thousands of businesses already growing with EDMICH. Start
              your 14-day free trial today—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SmartCTA className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </SmartCTA>

              <Link
                href="https://wa.me/2349025579441"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-white/30 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </Link>
            </div>

            {/* Final stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
