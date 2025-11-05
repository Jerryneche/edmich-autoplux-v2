"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import CartIconBadge from "@/app/components/CartIconBadge";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  const navItems = [
    { href: "/business", label: "Business", icon: BuildingOfficeIcon },
    { href: "/shop", label: "Shop", icon: ShoppingBagIcon },
    { href: "/about", label: "About", icon: InformationCircleIcon },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <span className="font-bold text-2xl bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
            EDMICH
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-neutral-700 hover:text-blue-600 hover:bg-neutral-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            );
          })}

          {/* Cart Icon - Desktop (Shows for guests and BUYER role only) */}
          {(!session || session?.user?.role === "BUYER") && <CartIconBadge />}

          {/* Conditional Login/Dashboard Button */}
          {status === "loading" ? (
            <div className="ml-4 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : session ? (
            <div className="ml-4 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-all"
              >
                <UserCircleIcon className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-4 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 group"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              Login
            </Link>
          )}
        </div>

        {/* Mobile Right Side - Cart + Menu */}
        <div className="md:hidden flex items-center gap-2">
          {/* Cart Icon - Mobile (Shows for guests and BUYER role only) */}
          {(!session || session?.user?.role === "BUYER") && <CartIconBadge />}

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-xl text-neutral-700 hover:text-blue-600 hover:bg-neutral-50 transition-all duration-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/50 px-6 py-6 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-neutral-700 hover:text-blue-600 hover:bg-neutral-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          {/* Mobile Login/Dashboard */}
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-neutral-100 text-neutral-900 rounded-xl text-base font-semibold hover:bg-neutral-200 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-neutral-600 hover:bg-neutral-100 rounded-xl text-base font-medium transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-base font-semibold hover:shadow-lg transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
