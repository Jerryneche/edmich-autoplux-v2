// app/business/services/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getMechanics() {
  try {
    const mechanics = await prisma.mechanicProfile.findMany({
      where: {
        approved: true,
        available: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
      take: 50,
    });

    return mechanics;
  } catch (error) {
    console.error("Failed to fetch mechanics:", error);
    return [];
  }
}

async function getLogistics() {
  try {
    const logistics = await prisma.logisticsProfile.findMany({
      where: {
        approved: true,
        available: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
      take: 50,
    });

    return logistics;
  } catch (error) {
    console.error("Failed to fetch logistics:", error);
    return [];
  }
}

export default async function ServicesPage() {
  const [mechanics, logistics] = await Promise.all([
    getMechanics(),
    getLogistics(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-green-100 text-purple-700 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>Professional Services Available</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
            Book Trusted{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-green-600 bg-clip-text text-transparent">
              Auto Services
            </span>
          </h1>

          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with verified mechanics and logistics providers across
            Nigeria. Quality service, transparent pricing, delivered to your
            location.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900">
                  {mechanics.length}+
                </p>
                <p className="text-sm text-neutral-600">Mechanics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-neutral-900">
                  {logistics.length}+
                </p>
                <p className="text-sm text-neutral-600">Logistics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanics Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <WrenchScrewdriverIcon className="h-8 w-8 text-purple-600" />
              <h2 className="text-4xl font-bold text-neutral-900">
                Professional Mechanics
              </h2>
            </div>
            <p className="text-lg text-neutral-600">
              Certified mechanics ready to service your vehicle
            </p>
          </div>

          {mechanics.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-neutral-200">
              <WrenchScrewdriverIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                No Mechanics Available Yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8">
                We're onboarding certified mechanics. Check back soon!
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Register as Mechanic
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mechanics.map((mechanic) => (
                <div
                  key={mechanic.id}
                  className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-purple-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 mb-1">
                        {mechanic.businessName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{mechanic.location}</span>
                      </div>
                    </div>
                    {mechanic.verified && (
                      <CheckBadgeIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mechanic.specialization
                        .slice(0, 3)
                        .map((spec: string) => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      {mechanic.specialization.length > 3 && (
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                          +{mechanic.specialization.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>{mechanic.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>₦{mechanic.hourlyRate.toLocaleString()}/hour</span>
                    </div>
                  </div>

                  {/* Footer with Actions */}
                  <div className="space-y-3 pt-4 border-t-2 border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-neutral-900">
                          {mechanic.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({mechanic.completedJobs})
                        </span>
                      </div>
                      <a
                        href={`tel:${mechanic.phone}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Call
                      </a>
                    </div>

                    <Link
                      href={`/booking/mechanic/${mechanic.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                    >
                      <CalendarDaysIcon className="h-5 w-5" />
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Logistics Section */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <TruckIcon className="h-8 w-8 text-green-600" />
              <h2 className="text-4xl font-bold text-neutral-900">
                Logistics Providers
              </h2>
            </div>
            <p className="text-lg text-neutral-600">
              Reliable delivery services for your auto parts
            </p>
          </div>

          {logistics.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-neutral-200">
              <TruckIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                No Logistics Providers Available Yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8">
                We're onboarding delivery partners. Check back soon!
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Register as Logistics Provider
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logistics.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 mb-1">
                        {provider.companyName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>
                          {provider.city}, {provider.state}
                        </span>
                      </div>
                    </div>
                    {provider.verified && (
                      <CheckBadgeIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  {/* Vehicle Types */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-neutral-600 mb-2">
                      Vehicle Types
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {provider.vehicleTypes.slice(0, 2).map((type: string) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          {type}
                        </span>
                      ))}
                      {provider.vehicleTypes.length > 2 && (
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                          +{provider.vehicleTypes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coverage */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-neutral-600 mb-2">
                      Coverage Areas
                    </p>
                    <p className="text-sm text-neutral-700">
                      {provider.coverageAreas.length} states covered
                    </p>
                  </div>

                  {/* Footer with Actions */}
                  <div className="space-y-3 pt-4 border-t-2 border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-neutral-900">
                          {provider.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({provider.completedDeliveries})
                        </span>
                      </div>
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Call
                      </a>
                    </div>

                    <Link
                      href={`/booking/logistics/${provider.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                    >
                      <CalendarDaysIcon className="h-5 w-5" />
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
