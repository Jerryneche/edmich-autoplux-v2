import Link from "next/link";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-neutral-50 to-white border-t border-neutral-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                EDMICH
              </span>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Nigeria&apos;s leading B2B automotive marketplace connecting
              suppliers, buyers, and mechanics.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.x.com/edmichservices"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-neutral-600 group-hover:text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.whatsapp.com/2349025579441"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-neutral-600 group-hover:text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/edmich-services"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-neutral-600 group-hover:text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/edmichservices"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-neutral-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-neutral-600 group-hover:text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  For Business
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/business/mechanics"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Find Mechanics
                </Link>
              </li>
              <li>
                <Link
                  href="/business/logistics"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Logistics
                </Link>
              </li>
              <li>
                <Link
                  href="/business/logistics/track"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-600">
                  123 Allen Avenue
                  <br />
                  Ikeja, Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <a
                  href="tel:+2349025579441"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  +234 9025 579 441
                </a>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <a
                  href="mailto:EDMICHSERVICES@GMAIL.COM"
                  className="text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  info@edmich.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-neutral-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-neutral-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/help"
              className="text-neutral-600 hover:text-blue-600 transition-colors"
            >
              Help Center
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} EDMICH Autoplux. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
