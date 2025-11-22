"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(standalone);

    // Detect platform
    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);

    setIsIOS(ios);
    if (ios) setPlatform("ios");
    else if (android) setPlatform("android");
    else setPlatform("desktop");

    // Listen for install prompt
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

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

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
            home screen convenience.
          </p>

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
              {/* Install Button - Android/Desktop */}
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  Install Now
                </button>
              )}

              {/* Manual Instructions */}
              {!deferredPrompt && (
                <p className="text-neutral-600 mb-8">
                  Follow the instructions below to install on your device
                </p>
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
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Instant loading with offline caching",
              },
              {
                icon: "📱",
                title: "Native Experience",
                desc: "Works like a real app on your device",
              },
              {
                icon: "🔄",
                title: "Offline Access",
                desc: "Browse products even without internet",
              },
              {
                icon: "🏠",
                title: "Home Screen Icon",
                desc: "Easy access from your home screen",
              },
              {
                icon: "🔔",
                title: "Push Notifications",
                desc: "Get updates on orders and deals",
              },
              {
                icon: "💾",
                title: "Saves Data",
                desc: "Uses less data than mobile browser",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {feature.title}
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
          <h2 className="text-3xl font-black text-neutral-900 mb-12 text-center">
            How to Install
          </h2>

          {/* iOS Instructions */}
          {platform === "ios" && (
            <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-neutral-900">
                  Install on iPhone/iPad
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
                      Make sure you're using Safari (not Chrome or other
                      browsers)
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
                        📤
                      </span>
                    </p>
                    <p className="text-neutral-600">
                      Located at the bottom of your Safari browser
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">
                      Select "Add to Home Screen"{" "}
                      <span className="inline-block px-3 py-1 bg-neutral-100 rounded text-2xl">
                        ➕
                      </span>
                    </p>
                    <p className="text-neutral-600">
                      Scroll down in the share menu to find this option
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">Tap "Add"</p>
                    <p className="text-neutral-600">
                      The EDMICH app will appear on your home screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Instructions */}
          {platform === "android" && !deferredPrompt && (
            <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <DevicePhoneMobileIcon className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-neutral-900">
                  Install on Android
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">
                      Tap the Menu Button (⋮)
                    </p>
                    <p className="text-neutral-600">
                      Located in the top-right corner of Chrome
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">
                      Select "Install App" or "Add to Home Screen"
                    </p>
                    <p className="text-neutral-600">
                      You'll see an install banner at the bottom
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">
                      Tap "Install"
                    </p>
                    <p className="text-neutral-600">
                      The app will be added to your home screen and app drawer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Instructions */}
          {platform === "desktop" && !deferredPrompt && (
            <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-xl">
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
                      Look for the Install Icon
                    </p>
                    <p className="text-neutral-600">
                      In Chrome/Edge address bar, you'll see an install icon (⊕)
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
                    <p className="text-neutral-600">
                      Or use Menu → More Tools → Install as App
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 mb-2">
                      Launch from Desktop
                    </p>
                    <p className="text-neutral-600">
                      The app will open in its own window, like a native app
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
