import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MapPinIcon,
  ClockIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

// Mock data - Replace with actual API call
const PLACEHOLDER_MECHANICS = [
  {
    id: "1",
    name: "Emmanuel Okafor",
    specialty: "Engine Specialist",
    bio: "With over 12 years of experience, I specialize in engine diagnostics, repairs, and performance tuning. Certified by Toyota and Honda service centers.",
    rating: 4.9,
    totalReviews: 156,
    completedJobs: 342,
    experience: "12 years",
    location: "Lagos, Victoria Island",
    hourlyRate: 8000,
    email: "emmanuel.okafor@edmich.com",
    phone: "+234 801 234 5678",
    verified: true,
    available: true,
    certifications: ["ASE Certified", "Toyota Certified", "Honda Certified"],
    specializations: [
      "Engine Repair",
      "Diagnostics",
      "Performance Tuning",
      "Oil Changes",
    ],
    languages: ["English", "Igbo"],
    workingHours: "Mon-Sat: 8:00 AM - 6:00 PM",
    responseTime: "Within 2 hours",
    profileImage: "/placeholder-mechanic.jpg",
  },
  {
    id: "2",
    name: "Chioma Adewale",
    specialty: "Electrical Systems Expert",
    bio: "Specialized in automotive electrical systems, AC repair, and modern car electronics. 9 years of hands-on experience with all vehicle makes.",
    rating: 4.8,
    totalReviews: 203,
    completedJobs: 428,
    experience: "9 years",
    location: "Abuja, Garki",
    hourlyRate: 7500,
    email: "chioma.adewale@edmich.com",
    phone: "+234 802 345 6789",
    verified: true,
    available: true,
    certifications: ["Automotive Electrician", "AC Specialist"],
    specializations: [
      "Electrical Systems",
      "AC Repair",
      "Car Electronics",
      "Wiring",
    ],
    languages: ["English", "Yoruba"],
    workingHours: "Mon-Fri: 9:00 AM - 5:00 PM",
    responseTime: "Within 1 hour",
    profileImage: "/placeholder-mechanic.jpg",
  },
];

async function getMechanic(id: string) {
  // TODO: Replace with actual API call to your database
  // const res = await fetch(`${process.env.API_URL}/api/mechanics/${id}`);
  // if (!res.ok) return null;
  // return res.json();

  // Using placeholder data for now
  return PLACEHOLDER_MECHANICS.find((m) => m.id === id) || null;
}

async function getMechanicReviews(_id: string) {
  // TODO: Replace with actual API call
  return [
    {
      id: 1,
      author: "Tunde Bakare",
      rating: 5,
      date: "2 days ago",
      comment:
        "Excellent service! Fixed my engine issue quickly and professionally. Highly recommended!",
      verified: true,
    },
    {
      id: 2,
      author: "Sarah Johnson",
      rating: 5,
      date: "1 week ago",
      comment:
        "Very knowledgeable and honest. Explained everything clearly and didn't overcharge.",
      verified: true,
    },
    {
      id: 3,
      author: "Adeola Peters",
      rating: 4,
      date: "2 weeks ago",
      comment:
        "Great work on my transmission. Took a bit longer than expected but quality was top-notch.",
      verified: true,
    },
  ];
}

export default async function MechanicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const mechanic = await getMechanic(params.id);
  const reviews = await getMechanicReviews(params.id);

  if (!mechanic) {
    notFound();
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Left & Center */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header Card */}
              <div className="relative bg-white rounded-3xl shadow-xl border-2 border-neutral-200 overflow-hidden">
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                  {mechanic.available && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-white">
                        Available Now
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-8 pb-8">
                  {/* Profile Image */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
                    <div className="w-32 h-32 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center">
                      <UserGroupIcon className="h-16 w-16 text-purple-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900">
                          {mechanic.name}
                        </h1>
                        {mechanic.verified && (
                          <CheckBadgeIcon className="h-7 w-7 text-blue-600" />
                        )}
                      </div>
                      <p className="text-lg text-purple-600 font-semibold mb-3">
                        {mechanic.specialty}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <StarSolid className="h-5 w-5 text-yellow-400" />
                          <span className="font-bold text-neutral-900">
                            {mechanic.rating}
                          </span>
                          <span className="text-neutral-600">
                            ({mechanic.totalReviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <WrenchScrewdriverIcon className="h-5 w-5" />
                          <span>{mechanic.completedJobs} jobs completed</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <ClockIcon className="h-5 w-5" />
                          <span>{mechanic.experience} experience</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-2">
                      About
                    </h2>
                    <p className="text-neutral-700 leading-relaxed">
                      {mechanic.bio}
                    </p>
                  </div>

                  {/* Specializations */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-3">
                      Specializations
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mechanic.specializations.map((spec, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium text-sm border border-purple-200"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 mb-3">
                      Certifications
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {mechanic.certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900 text-sm">
                            {cert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-3xl shadow-xl border-2 border-neutral-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <StarSolid className="h-6 w-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-neutral-900">
                      {mechanic.rating}
                    </span>
                    <span className="text-neutral-600">
                      ({mechanic.totalReviews})
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-neutral-200 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-neutral-900">
                              {review.author}
                            </p>
                            {review.verified && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500">
                            {review.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarSolid
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-neutral-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Right */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="sticky top-32 bg-white rounded-3xl shadow-xl border-2 border-neutral-200 p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-neutral-600 mb-1">Hourly Rate</p>
                  <p className="text-4xl font-bold text-purple-600 mb-2">
                    ₦{mechanic.hourlyRate.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-500">per hour</p>
                </div>

                <Link
                  href={`/business/mechanics/booking?mechanic=${mechanic.id}`}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all mb-4"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Book Now
                </Link>

                <button className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-100 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-200 transition-all">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  Send Message
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-3xl shadow-xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="font-medium text-neutral-900">
                        {mechanic.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Phone</p>
                      <a
                        href={`tel:${mechanic.phone}`}
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        {mechanic.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <a
                        href={`mailto:${mechanic.email}`}
                        className="font-medium text-purple-600 hover:text-purple-700 break-all"
                      >
                        {mechanic.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Working Hours</p>
                      <p className="font-medium text-neutral-900">
                        {mechanic.workingHours}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Response Time</p>
                      <p className="font-medium text-neutral-900">
                        {mechanic.responseTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mechanic.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white text-neutral-900 rounded-lg font-medium text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
