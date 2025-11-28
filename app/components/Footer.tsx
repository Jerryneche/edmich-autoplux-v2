// app/components/Footer.tsx
"use client";
import Link from "next/link";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand + Trust */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TruckIcon className="h-7 w-7 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EDMICH
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Nigeria&apos;s #1 B2B auto parts marketplace. Connecting verified
              suppliers, buyers, and mechanics with fast logistics.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 text-blue-600" />
                <span>24/7</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCardIcon className="h-4 w-4 text-purple-600" />
                <span>Secure</span>
              </div>
              <Link
                href="/install"
                className="hover:text-blue-600 transition-colors"
              >
                📱 Install App
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About Us" },
                { href: "/business", label: "For Business" },
                { href: "/careers", label: "Careers" },
                { href: "/blog", label: "Blog" },
                { href: "/suppliers", label: "Suppliers" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/shop", label: "Marketplace" },
                { href: "/business/mechanics", label: "Find Mechanics" },
                { href: "/business/logistics", label: "Logistics" },
                { href: "/track", label: "UNIVERSAL TRACK (ORDERS, BOOKINGS)" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-gray-600">
                  123 Allen Avenue
                  <br />
                  Ikeja, Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <a
                  href="tel:+2349025579441"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  +234 902 557 9441
                </a>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <a
                  href="mailto:edmichservices@gmail.com"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  edmichservices@gmail.com
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {[
                { href: "https://x.com/edmichservices", icon: "twitter" },
                { href: "https://wa.me/2349025579441", icon: "whatsapp" },
                {
                  href: "https://linkedin.com/company/edmich-services",
                  icon: "linkedin",
                },
                {
                  href: "https://instagram.com/edmichservices",
                  icon: "instagram",
                },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {social.icon === "twitter" && (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    )}
                    {social.icon === "whatsapp" && (
                      <path d="M12.04 2C6.47 2 2 6.47 2 12.04c0 2.18.7 4.2 1.89 5.86l-1.23 3.7a.5.5 0 0 0 .63.63l3.7-1.23c1.66 1.19 3.68 1.89 5.86 1.89 5.57 0 10.04-4.47 10.04-10.04C22.08 6.47 17.61 2 12.04 2zm4.55 14.34c-.24.24-.55.36-.9.36-.26 0-.5-.08-.74-.24l-1.68-1.01c-.24-.14-.52-.14-.76 0l-1.68 1.01c-.24.14-.52.14-.76 0l-1.68-1.01c-.24-.14-.24-.38 0-.52l1.68-1.01c.24-.14.24-.38 0-.52l-1.68-1.01c-.24-.14-.24-.38 0-.52l1.68-1.01c.24-.14.52-.14.76 0l1.68 1.01c.24.14.52.14.76 0l1.68-1.01c.24-.14.52-.14.76 0l1.68 1.01c.24.14.24.38 0 .52l-1.68 1.01c-.24.14-.24.38 0 .52l1.68 1.01c.24.14.24.38 0 .52z" />
                    )}
                    {social.icon === "linkedin" && (
                      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.38c-.97 0-1.75-.79-1.75-1.75s.79-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.38h-3v-5.5c0-1.31-.03-3-1.84-3-1.84 0-2.12 1.42-2.12 2.89v5.61h-3v-10h2.88v1.37h.04c.4-.76 1.38-1.56 2.84-1.56 3.03 0 3.59 2 3.59 4.59v5.6z" />
                    )}
                    {social.icon === "instagram" && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-6 text-gray-600">
            {[
              { href: "/terms", label: "Terms" },
              { href: "/blog", label: "blog" },
              { href: "/careers", label: "careers" },
              { href: "/legal", label: "Privacy" },
              { href: "/support", label: "Help" },
              { href: "tel:+2349025579441", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-gray-500">
            © {currentYear}{" "}
            <span className="font-medium text-blue-600">EDMICH Autoplux</span>.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
