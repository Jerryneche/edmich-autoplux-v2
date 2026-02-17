"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { WifiIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <WifiIcon className="h-16 w-16 text-neutral-400" />
          </div>

          <h1 className="text-4xl font-black text-neutral-900 mb-4">
            You're Offline
          </h1>

          <p className="text-xl text-neutral-600 mb-8">
            It looks like you've lost your internet connection. Some features
            may be limited.
          </p>

          <button
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Try Again
          </button>

          <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
            <p className="text-sm text-neutral-700">
              <strong>💡 Tip:</strong> When you're back online, the app will
              automatically sync your data.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
