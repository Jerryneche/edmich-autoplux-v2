"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  UsersIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  HeartIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ImpactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full mb-6">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-600">
                EDMICH Mobility Impact Initiative
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-6">
              Building Africa's Most Trusted{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mobility Infrastructure
              </span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We're not just a marketplace. We're a mission-driven ecosystem
              solving systemic problems in Africa's automotive sector through
              technology, verification, and empowerment.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "15,000+", label: "Lives Impacted", icon: UsersIcon },
              {
                value: "500+",
                label: "SMEs Digitized",
                icon: BuildingStorefrontIcon,
              },
              {
                value: "2,000+",
                label: "Youth Trained",
                icon: AcademicCapIcon,
              },
              { value: "95%", label: "Genuine Parts", icon: ShieldCheckIcon },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-4xl font-black text-neutral-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-600 font-semibold">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <GlobeAltIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Our Vision
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                To build Africa's most trusted mobility infrastructure by
                ensuring access to safe auto parts, empowering mechanics, and
                digitizing small automotive businesses across the continent.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed">
                To reduce road accidents, promote job creation, and support
                local automotive SMEs through technology, verification, digital
                logistics, and accessible training programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              Our Three-Pillar Impact Model
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Every aspect of EDMICH is designed to create measurable social and
              economic impact across Africa's mobility sector.
            </p>
          </div>

          <div className="space-y-8">
            {/* Pillar 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 md:p-12 border-2 border-blue-200">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                    <span className="text-sm font-bold text-blue-700">
                      PILLAR 1
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                    Safe Mobility & Quality Auto Parts
                  </h3>
                  <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                    We're tackling Africa's ₦2.4 billion monthly loss to
                    counterfeit parts by implementing rigorous supplier
                    verification, quality control standards, and
                    accident-reduction initiatives.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        500+
                      </p>
                      <p className="text-sm text-neutral-600 font-semibold">
                        Verified Suppliers
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        95%
                      </p>
                      <p className="text-sm text-neutral-600 font-semibold">
                        Genuine Parts Rate
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        Zero
                      </p>
                      <p className="text-sm text-neutral-600 font-semibold">
                        Tolerance for Fakes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-purple-200">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <AcademicCapIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                    <span className="text-sm font-bold text-purple-700">
                      PILLAR 2
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                    Mechanic Empowerment & Skills Development
                  </h3>
                  <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                    Addressing youth unemployment through comprehensive training
                    programs, digital tools, certification pathways, and special
                    initiatives for underrepresented groups in the automotive
                    sector.
                  </p>
                  <div className="space-y-3">
                    {[
                      "EDMICH Mechanic Academy – Professional Training & Certification",
                      "Women in Auto Mechanics Program – Breaking Gender Barriers",
                      "Digital Tools & Booking Platform – Modern Business Solutions",
                      "Continuous Skills Development – Staying Current with Technology",
                    ].map((program, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white rounded-xl p-4 border border-purple-200"
                      >
                        <CheckBadgeIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                        <p className="text-neutral-700 font-medium">
                          {program}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-2 border-green-200">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
                    <span className="text-sm font-bold text-green-700">
                      PILLAR 3
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                    SME Digitization & Economic Inclusion
                  </h3>
                  <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                    Transforming small automotive businesses through digital
                    infrastructure, data-driven visibility, streamlined
                    operations, and integrated logistics solutions.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: ChartBarIcon,
                        title: "Data-Driven Growth",
                        desc: "Analytics & insights for better decisions",
                      },
                      {
                        icon: TruckIcon,
                        title: "Integrated Logistics",
                        desc: "Seamless delivery across Nigeria",
                      },
                      {
                        icon: LightBulbIcon,
                        title: "Digital Training",
                        desc: "Online & offline skills programs",
                      },
                      {
                        icon: UsersIcon,
                        title: "Market Access",
                        desc: "Connect with thousands of buyers",
                      },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl p-4 border border-green-200 hover:shadow-md transition-shadow"
                      >
                        <feature.icon className="h-8 w-8 text-green-600 mb-3" />
                        <p className="font-bold text-neutral-900 mb-1">
                          {feature.title}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Programs */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
              EDMICH Mobility Impact Initiative (EMII)
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our dedicated programs creating measurable change across Africa's
              mobility ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: AcademicCapIcon,
                title: "Mechanic Academy",
                desc: "Professional training & certification for 5,000+ youth mechanics annually",
                color: "purple",
              },
              {
                icon: UsersIcon,
                title: "Women in Auto Mechanics",
                desc: "Breaking gender barriers with specialized training and mentorship",
                color: "pink",
              },
              {
                icon: BuildingStorefrontIcon,
                title: "SME Digital Accelerator",
                desc: "Digitizing 1,000+ automotive SMEs with tools, training, and market access",
                color: "blue",
              },
              {
                icon: ShieldCheckIcon,
                title: "Quality Parts Verification Lab",
                desc: "Testing and certifying genuine parts to ensure road safety",
                color: "green",
              },
              {
                icon: ChartBarIcon,
                title: "Mobility Data Infrastructure",
                desc: "Building Africa's first comprehensive automotive sector database",
                color: "indigo",
              },
              {
                icon: TruckIcon,
                title: "Last-Mile Logistics Network",
                desc: "Reliable distribution infrastructure for the mobility industry",
                color: "orange",
              },
            ].map((program, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl hover:scale-105 transition-all"
              >
                <div
                  className={`w-14 h-14 bg-${program.color}-100 rounded-xl flex items-center justify-center mb-4`}
                >
                  <program.icon
                    className={`h-7 w-7 text-${program.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {program.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {program.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
            <HeartIcon className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Partner With Us to Drive Impact
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              We're building infrastructure for Africa's mobility economy. Join
              us as a funder, partner, or collaborator to scale our impact
              across the continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
              >
                <HeartIcon className="h-5 w-5" />
                Partner With Us
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-all border-2 border-white/20"
              >
                <SparklesIcon className="h-5 w-5" />
                Explore Our Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
