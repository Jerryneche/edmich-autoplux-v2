// app/not-found.tsx
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "404 - Page Not Found | Edmich Autoplux",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  const quickLinks = [
    {
      title: "Home",
      description: "Go back to homepage",
      href: "/",
      icon: HomeIcon,
      color: "blue",
    },
    {
      title: "Shop Products",
      description: "Browse auto parts",
      href: "/business/market",
      icon: ShoppingBagIcon,
      color: "purple",
    },
    {
      title: "Find Services",
      description: "Book mechanics & logistics",
      href: "/business/services",
      icon: WrenchScrewdriverIcon,
      color: "green",
    },
    {
      title: "Search",
      description: "Search our marketplace",
      href: "/business/market",
      icon: MagnifyingGlassIcon,
      color: "orange",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white flex items-center justify-center px-6 py-32">
        <div className="max-w-4xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              404
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30" />
              </div>
              <div className="relative">
                <svg
                  className="w-48 h-48 mx-auto text-neutral-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
            The page you're looking for seems to have taken a wrong turn. Let's
            get you back on track!
          </p>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-12 h-12 bg-${link.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <link.icon className={`h-6 w-6 text-${link.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {link.title}
                </h3>
                <p className="text-sm text-neutral-600">{link.description}</p>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-neutral-600 mb-4">
              Or search for what you need:
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, services, or pages..."
                className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-blue-500 focus:outline-none text-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Additional Help */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Still need help?
            </h3>
            <p className="text-neutral-600 mb-6">
              Our support team is here to assist you
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/support"
                className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all"
              >
                Contact Support
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>

          {/* Error Code */}
          <p className="text-sm text-neutral-400 mt-8">
            Error Code: 404 - Page Not Found
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
