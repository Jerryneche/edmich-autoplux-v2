"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function QuickTrackWidget() {
  const [trackingId, setTrackingId] = useState("");
  const router = useRouter();

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track?id=${trackingId.trim()}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MagnifyingGlassIcon className="w-6 h-6" />
        Quick Track
      </h3>
      <form onSubmit={handleQuickTrack} className="flex gap-3">
        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID"
          className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Track
        </button>
      </form>
      <p className="text-sm mt-3 opacity-90">
        Track orders, deliveries, or services instantly
      </p>
    </div>
  );
}
