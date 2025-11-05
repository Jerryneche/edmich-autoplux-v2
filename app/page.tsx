import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import Footer from "@/app/components/Footer";
import WelcomeModal from "./components/WelcomeModal";
import {
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <>
      <WelcomeModal />
      <Header />

      <main>
        {/* Hero Section */}
        <Hero
          image="/hero-home.jpg"
          title="Welcome to Edmich Autoplux"
          subtitle="Nigeria's B2B auto parts marketplace — connecting suppliers, buyers, and mechanics seamlessly."
          primaryCta={{ label: "Explore Shop", href: "/shop" }}
          secondaryCta={{ label: "For Businesses", href: "/business" }}
        />

        {/* Modern Value Proposition Section */}
        <section className="bg-gradient-to-b from-white via-neutral-50 to-white">
          <div className="container mx-auto px-4 pt-24 pb-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
                    Why Edmich
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
                  Your trusted{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    automotive
                  </span>{" "}
                  marketplace
                </h2>
                <p className="text-xl text-neutral-600 leading-relaxed">
                  We connect suppliers, buyers, and mechanics in one seamless
                  platform. No more endless searching—just genuine parts,
                  verified sellers, and reliable service bookings.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <a
                    href="https://wa.me/2349025579441?text=Hi%20Edmich%20Autoplux%2C%20I%27m%20ready%20to%20upgrade%20my%20ride%20with%20genuine%20auto%20parts.%20Let%27s%20talk!"
                    target="_blank"
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition group"
                  >
                    <span>Get in touch</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right - Benefit Cards */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl transform rotate-3 opacity-50"></div>

                <div className="relative bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-neutral-100">
                  {/* Supplier */}
                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-1">
                        For Suppliers
                      </h3>
                      <p className="text-neutral-600">
                        List your products and connect with verified buyers
                        across Nigeria
                      </p>
                    </div>
                  </div>

                  {/* Buyer */}
                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-1">
                        For Buyers
                      </h3>
                      <p className="text-neutral-600">
                        Source genuine parts from trusted suppliers with
                        confidence
                      </p>
                    </div>
                  </div>

                  {/* Mechanic */}
                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-1">
                        For Mechanics
                      </h3>
                      <p className="text-neutral-600">
                        Book services and source quality parts instantly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Features Section */}
        <section className="bg-gradient-to-b from-white via-neutral-50 to-white">
          <div className="container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">
                Platform Features
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold text-neutral-900">
                Built for the modern automotive industry
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    Verified Sellers
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Every supplier goes through our rigorous approval process to
                    ensure quality, authenticity, and trust for all
                    transactions.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    Fast Logistics
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    End-to-end delivery management with real-time tracking,
                    ensuring your parts arrive quickly and safely.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    Service Bookings
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Schedule mechanic appointments with detailed notes and
                    flexible time slots—all managed in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
