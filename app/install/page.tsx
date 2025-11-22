"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );
  const [browserName, setBrowserName] = useState("Chrome");

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(standalone);

    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);

    if (/Opera|OPR/.test(userAgent)) setBrowserName("Opera");
    else if (/UCBrowser/.test(userAgent)) setBrowserName("UC Browser");
    else if (/Firefox/.test(userAgent)) setBrowserName("Firefox");
    else if (/Edg/.test(userAgent)) setBrowserName("Edge");
    else if (/Chrome/.test(userAgent)) setBrowserName("Chrome");
    else setBrowserName("your browser");

    setIsIOS(ios);
    if (ios) setPlatform("ios");
    else if (android) setPlatform("android");
    else setPlatform("desktop");

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full mb-6">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600">
              Progressive Web App
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-6">
            Install{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EDMICH AutoPlux
            </span>
          </h1>

          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Get the full app experience with offline access, faster loading, and
            home screen convenience. Works on ALL browsers!
          </p>

          {/* Browser Detection Notice */}
          <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl max-w-md mx-auto">
            <div className="flex items-center gap-2 justify-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <p className="font-bold text-yellow-900">
                You're using {browserName}
              </p>
            </div>
            <p className="text-sm text-yellow-800">
              {deferredPrompt
                ? "You can install directly with one click!"
                : "Follow the instructions below to install on your device"}
            </p>
          </div>

          {/* Install Status */}
          {isInstalled ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-50 border-2 border-green-200 rounded-2xl">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-bold text-green-900">App Installed!</p>
                <p className="text-sm text-green-700">
                  You're using the installed version
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* One-Click Install Button */}
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  Install Now (Recommended)
                </button>
              )}

              {/* Manual Instructions for Android */}
              {!deferredPrompt && platform === "android" && (
                <div className="space-y-4">
                  <p className="text-neutral-600">
                    Follow the instructions below for your browser
                  </p>

                  {/* Chrome/Edge Recommendation */}
                  <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl max-w-2xl mx-auto text-left">
                    <p className="font-bold text-blue-900 mb-3">
                      Recommended for Best Experience:
                    </p>
                    <p className="text-blue-800 mb-4">
                      For the easiest installation and best performance, we
                      recommend using <strong>Chrome</strong> or{" "}
                      <strong>Edge</strong> browser.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="https://play.google.com/store/apps/details?id=com.android.chrome"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold border-2 border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Get Chrome
                      </Link>
                      <Link
                        href="https://play.google.com/store/apps/details?id=com.microsoft.emmx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold border-2 border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Get Edge
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-neutral-900 mb-12 text-center">
            Why Install EDMICH?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "Lightning Fast",
                desc: "Instant loading with offline caching",
              },
              {
                icon: "Native Experience",
                desc: "Works like a real app on your device",
              },
              {
                icon: "Offline Access",
                desc: "Browse products even without internet",
              },
              {
                icon: "Home Screen Icon",
                desc: "Easy access from your home screen",
              },
              {
                icon: "Saves Data",
                desc: "Uses less mobile data than regular browsing",
              },
              {
                icon: "Works Everywhere",
                desc: "Chrome, Opera, UC Browser, Firefox & more",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {feature.icon}
                </h3>
                <p className="text-neutral-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-neutral-900 mb-4 text-center">
            How to Install
          </h2>
          <p className="text-center text-neutral-600 mb-12">
            Choose your device and browser below
          </p>

          <div className="space-y-8">
            {/* iOS */}
            {platform === "ios" && (
              <div className="bg-white rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Install on iPhone/iPad (Safari)
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Open in Safari Browser
                      </p>
                      <p className="text-neutral-600">
                        Make sure you're using Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Tap the Share Button{" "}
                        <span className="inline-block px-3 py-1 bg-neutral-100 rounded text-2xl">
                          Share
                        </span>
                      </p>
                      <p className="text-neutral-600">
                        Bottom center of Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Scroll and tap "Add to Home Screen"{" "}
                        <span className="inline-block px-3 py-1 bg-neutral-100 rounded text-2xl">
                          Plus
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Tap "Add"
                      </p>
                      <p className="text-neutral-600">
                        EDMICH icon appears on home screen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Android - One Click */}
            {platform === "android" && deferredPrompt && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Easy Install (Chrome/Edge)
                  </h3>
                </div>
                <p className="text-lg text-neutral-700 mb-6">
                  Just click the "Install Now" button above!
                </p>
              </div>
            )}

            {/* Android Manual Instructions */}
            {platform === "android" && !deferredPrompt && (
              <>
                {/* Chrome/Edge */}
                <div className="bg-white rounded-3xl p-8 border-2 border-green-200 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-neutral-900">
                      Chrome & Edge
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap Menu (Three Dots) top-right
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap "Install App" or "Add to Home Screen"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opera */}
                <div className="bg-white rounded-3xl p-8 border-2 border-red-200 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-red-600" />
                    <h3 className="text-2xl font-bold text-neutral-900">
                      Opera Browser
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap Opera menu (bottom-right)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap Settings → Home Screen → ADD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UC Browser */}
                <div className="bg-white rounded-3xl p-8 border-2 border-orange-200 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-orange-600" />
                    <h3 className="text-2xl font-bold text-neutral-900">
                      UC Browser
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap Menu (Three Lines) at bottom
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Toolbox → Add to Home Screen → Add
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Firefox */}
                <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-purple-600" />
                    <h3 className="text-2xl font-bold text-neutral-900">
                      Firefox
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap Menu (Three Dots)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 mb-2">
                          Tap "Install" or "Add to Home Screen"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Desktop */}
            {platform === "desktop" && (
              <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <ComputerDesktopIcon className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Install on Desktop
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Look for Install Icon in address bar
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 mb-2">
                        Click "Install EDMICH AutoPlux"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="mt-12 p-6 bg-neutral-100 rounded-2xl">
            <h3 className="font-bold text-neutral-900 mb-3 text-center">
              Need Help?
            </h3>
            <p className="text-center text-neutral-600 mb-4">
              Contact us anytime:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="https://wa.me/2349025579441"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                WhatsApp: +234 902 557 9441
              </Link>
              <Link
                href="mailto:edmichservices@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Email: edmichservices@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
