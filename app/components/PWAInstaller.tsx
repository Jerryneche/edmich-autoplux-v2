// app/components/PWAInstaller.tsx
"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (navigator as any).standalone === true;
    setIsStandalone(standalone || iosStandalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Only show banner if not dismissed in last 30 days
    const dismissed =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("pwa_dismissed_timestamp")
        : null;
    const now = Date.now();
    if (dismissed && now - parseInt(dismissed) < 30 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      localStorage.setItem("pwa_dismissed_timestamp", Date.now().toString());
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_dismissed_timestamp", Date.now().toString());
  };

  if (!isClient || isStandalone) return null;

  // iOS Modal
  if (showIOSModal) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 bg-black/70">
        <div className="w-full max-w-md bg-white rounded-t-3xl p-8 animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black">Install AutoPlux</h3>
            <button onClick={() => setShowIOSModal(false)}>
              <XMarkIcon className="h-7 w-7 text-gray-500" />
            </button>
          </div>
          <div className="space-y-6 text-left">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex-center text-blue-600 font-bold">
                1
              </div>
              <div>
                <p className="font-bold">Tap Share button</p>
                <p className="text-sm text-gray-600">Bottom of Safari</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex-center text-blue-600 font-bold">
                2
              </div>
              <div>
                <p className="font-bold">Add to Home Screen</p>
                <p className="text-sm text-gray-600">Scroll down in menu</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex-center text-blue-600 font-bold">
                3
              </div>
              <div>
                <p className="font-bold">Tap "Add"</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowIOSModal(false)}
            className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold"
          >
            Got It!
          </button>
        </div>
      </div>
    );
  }

  // Android Install Banner
  if (showBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-6 inset-x-6 z-[9999] max-w-md mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex-center">
              <ArrowDownTrayIcon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Install AutoPlux</h3>
              <p className="text-sm opacity-90 mt-1">
                Faster access & offline mode
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={dismiss}
                  className="px-5 py-2 bg-white/20 rounded-xl backdrop-blur"
                >
                  Later
                </button>
                <button
                  onClick={install}
                  className="px-6 py-2 bg-white text-blue-600 rounded-xl font-bold"
                >
                  Install Now
                </button>
              </div>
            </div>
            <button onClick={dismiss} className="self-start">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Floating Button
  if (isIOS) {
    return (
      <button
        onClick={() => setShowIOSModal(true)}
        className="fixed bottom-8 right-6 z-[9999] flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold shadow-2xl hover:scale-110 transition"
      >
        <ArrowDownTrayIcon className="h-6 w-6" />
        Install App
      </button>
    );
  }

  return null;
}
