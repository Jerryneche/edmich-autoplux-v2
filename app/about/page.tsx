"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  RocketLaunchIcon,
  GlobeAltIcon,
  BoltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen overflow-hidden">
      <Header />

      {/* Hero Section with Animated Background */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
              animation: "grid-move 20s linear infinite",
            }}
          ></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-64 h-64 bg-cyan-200/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 backdrop-blur-sm mb-8 animate-fade-in">
            <BoltIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Our Story</span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fade-in-up">
            <span className="block text-neutral-900">Building the</span>
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Future of Automotive
            </span>
          </h1>

          <p
            className="text-2xl text-neutral-700 max-w-3xl leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            EDMICH is not just a company—it&aposs a vision to revolutionize how
            Africa connects with automotive excellence.
          </p>
        </div>
      </section>

      {/* Story Section - Timeline Style */}
      <section className="relative py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* The Beginning */}
          <div className="relative pl-8 md:pl-16 border-l-2 border-blue-200 pb-16 group">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg group-hover:scale-125 transition-transform"></div>

            <div className="mb-4">
              <span className="text-blue-600 font-mono text-sm font-semibold">
                CHAPTER 01
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6 text-neutral-900">
                The Spark
              </h2>
            </div>

            <p className="text-xl text-neutral-700 leading-relaxed mb-4">
              In the heart of Lagos, a vision was born. The automotive industry
              in Africa was fragmented—suppliers struggled to reach buyers,
              mechanics worked in isolation, and genuine parts were hard to
              verify.
            </p>
            <p className="text-lg text-neutral-600 leading-relaxed">
              But what if technology could bridge these gaps? What if one
              platform could unite an entire ecosystem? That question sparked
              the creation of{" "}
              <span className="text-blue-600 font-semibold">EDMICH</span>.
            </p>
          </div>

          {/* The Vision */}
          <div className="relative pl-8 md:pl-16 border-l-2 border-purple-200 pb-16 group">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-purple-600 rounded-full border-4 border-white shadow-lg group-hover:scale-125 transition-transform"></div>

            <div className="mb-4">
              <span className="text-purple-600 font-mono text-sm font-semibold">
                CHAPTER 02
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6 text-neutral-900">
                The Blueprint
              </h2>
            </div>

            <p className="text-xl text-neutral-700 leading-relaxed mb-4">
              We studied the giants. Amazon revolutionized retail. Tesla
              transformed automotive. Alibaba connected global trade. We asked
              ourselves:{" "}
              <span className="italic text-neutral-900 font-medium">
                How do we bring that same innovation to Africa&aposs automotive
                sector
              </span>
            </p>
            <p className="text-lg text-neutral-600 leading-relaxed">
              The answer was{" "}
              <span className="text-purple-600 font-semibold">Autoplux</span>
              —our flagship B2B marketplace. But this was just the beginning.
              EDMICH was designed as an ecosystem, a parent company that could
              launch multiple ventures, each solving critical problems in the
              automotive value chain.
            </p>
          </div>

          {/* The Mission */}
          <div className="relative pl-8 md:pl-16 border-l-2 border-cyan-200 pb-16 group">
            <div className="absolute -left-3 top-0 w-6 h-6 bg-cyan-600 rounded-full border-4 border-white shadow-lg group-hover:scale-125 transition-transform"></div>

            <div className="mb-4">
              <span className="text-cyan-600 font-mono text-sm font-semibold">
                CHAPTER 03
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6 text-neutral-900">
                The Mission
              </h2>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-8 mb-6 shadow-xl">
              <p className="text-2xl font-semibold text-cyan-900 mb-4 italic">
                To make access to automotive parts and services as seamless as
                ordering food online—while empowering African businesses to
                compete globally.
              </p>
            </div>

            <p className="text-lg text-neutral-600 leading-relaxed">
              We&aposre building trust through verification. Speed through
              technology. Growth through connection. Every supplier verified.
              Every part traceable. Every transaction secure. This is automotive
              commerce, reimagined.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-gradient-to-b from-neutral-50 via-blue-50/30 to-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-neutral-900">
            Building at{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Scale
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserGroupIcon,
                number: "1000+",
                label: "Verified Suppliers",
                color: "blue",
              },
              {
                icon: GlobeAltIcon,
                number: "50+",
                label: "Cities Connected",
                color: "purple",
              },
              {
                icon: ChartBarIcon,
                number: "24/7",
                label: "Platform Uptime",
                color: "cyan",
              },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50`}
                ></div>
                <div className="relative bg-white backdrop-blur-sm border-2 border-neutral-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-2xl transition-all">
                  <stat.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <p className="text-neutral-600 text-lg font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-neutral-900">
            Our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Core Values
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Trust First",
                description:
                  "Every supplier verified. Every transaction protected. We build trust into every interaction.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50",
              },
              {
                icon: BoltIcon,
                title: "Lightning Fast",
                description:
                  "Speed matters. From search to delivery, we optimize every millisecond of your experience.",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50",
              },
              {
                icon: GlobeAltIcon,
                title: "Think Global",
                description:
                  "Starting in Nigeria, but building for the world. African innovation, global ambition.",
                gradient: "from-cyan-500 to-blue-500",
                bgGradient: "from-cyan-50 to-blue-50",
              },
              {
                icon: RocketLaunchIcon,
                title: "Always Innovating",
                description:
                  "Today's impossible is tomorrow's standard. We never stop pushing boundaries.",
                gradient: "from-pink-500 to-purple-500",
                bgGradient: "from-pink-50 to-purple-50",
              },
            ].map((value, i) => (
              <div key={i} className="group relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300`}
                ></div>
                <div className="relative bg-white backdrop-blur-sm border-2 border-neutral-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-neutral-900">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="relative py-24 mb-24 bg-gradient-to-b from-neutral-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-8 animate-bounce shadow-xl">
            <RocketLaunchIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-neutral-900">
            This Is Just{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              The Beginning
            </span>
          </h2>
          <p className="text-xl text-neutral-700 leading-relaxed mb-6">
            Autoplux is our first venture. But the EDMICH ecosystem will
            expand—new platforms, new services, new solutions. Think Amazon, but
            for automotive. Think bigger.
          </p>
          <p className="text-2xl font-semibold text-blue-600 italic">
            The future of automotive in Africa starts here. And we&aposre just
            getting started.
          </p>
        </div>
      </section>

      <Footer />

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  );
}
