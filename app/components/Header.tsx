// app/components/Header.tsx
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
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11">
            <div className="relative w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              {/* Optional: Remove or soften the background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-80"></div>

              {/* Logo image with improved visibility */}
              <img
                src="/logo.svg"
                alt="EDMICH Logo"
                className="relative z-10 w-10 h-10 object-contain"
              />
            </div>
          </div>

          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
            EDMICH
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            // ← ONLY `icon: Icon`
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            );
          })}

          {/* Cart - Desktop */}
          {(!session || session?.user?.role === "BUYER") && (
            <div className="ml-2">
              <CartIconBadge />
            </div>
          )}

          {/* Auth */}
          {status === "loading" ? (
            <div className="ml-4 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : session ? (
            <div className="ml-4 flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
              >
                <UserCircleIcon className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-4 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 group"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              Login
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-3">
          {(!session || session?.user?.role === "BUYER") && <CartIconBadge />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-6 space-y-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {label}
              </Link>
            );
          })}

          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 mt-4 bg-gray-100 text-gray-900 rounded-xl text-base font-semibold hover:bg-gray-200"
              >
                <UserCircleIcon className="h-5 w-5" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-gray-600 hover:bg-gray-100 rounded-xl text-base font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-base font-semibold hover:shadow-lg"
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
