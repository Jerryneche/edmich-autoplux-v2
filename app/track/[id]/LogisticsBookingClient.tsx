// app/track/[id]/LogisticsBookingClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  orderId: string;
  shippingAddress: any | null;
};

type Provider = {
  id: string;
  companyName: string;
  city: string;
  state: string;
  rating?: number;
  available?: boolean;
  user?: { name?: string; email?: string };
};

export default function LogisticsBookingClient({
  orderId,
  shippingAddress,
}: Props) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (shippingAddress?.city) q.set("city", shippingAddress.city);
      if (shippingAddress?.state) q.set("state", shippingAddress.state);
      q.set("available", "true");
      const res = await fetch(`/api/logistics?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to load providers");
      const data = await res.json();
      setProviders(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load logistics providers");
    } finally {
      setLoading(false);
    }
  };

  const assignProvider = async () => {
    if (!selected) {
      toast.error("Select a provider");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/assign-logistics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logisticsId: selected,
          providerMessage: "Assigned via tracking UI",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assign failed");
      toast.success("Logistics assigned successfully");
      // Optionally refresh page
      setTimeout(() => location.reload(), 700);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const filtered = providers.filter((p) => {
    if (!query) return true;
    return (
      p.companyName.toLowerCase().includes(query.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-3">Delivery & Logistics</h3>

      <div className="mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers or city..."
          className="w-full px-4 py-2 rounded-lg border-2 border-neutral-200 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-4 text-center">Loading providers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">
            No providers found
          </div>
        ) : (
          filtered.map((p) => (
            <label
              key={p.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 ${
                selected === p.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  🚚
                </div>
                <div>
                  <div className="font-semibold">{p.companyName}</div>
                  <div className="text-sm text-neutral-600">
                    {p.city}, {p.state} • {p.rating ?? "—"}★
                  </div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={selected === p.id}
                onChange={() => setSelected(p.id)}
                value={p.id}
              />
            </label>
          ))
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={assignProvider}
          disabled={!selected || assigning}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-60"
        >
          {assigning ? "Assigning..." : "Assign Selected Provider"}
        </button>
        <button
          onClick={fetchProviders}
          className="px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl font-semibold"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
