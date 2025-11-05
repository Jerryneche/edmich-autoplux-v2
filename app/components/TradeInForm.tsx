"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TradeInForm() {
  const [oldPart, setOldPart] = useState("");
  const [condition, setCondition] = useState("Good");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("oldPart", oldPart);
    formData.append("condition", condition);
    photos.forEach((photo) => formData.append("photos", photo));

    const res = await fetch("/api/trade-in", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      alert("Trade-in submitted! Credit coming soon.");
    }
    setLoading(false);
  };

  if (!session) return <p>Please sign in to trade in.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Trade In Old Parts</h2>
      <input
        type="text"
        placeholder="Part name (e.g., Brake pads)"
        value={oldPart}
        onChange={(e) => setOldPart(e.target.value)}
        className="w-full p-2 border mb-2"
        required
      />
      <select
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        className="w-full p-2 border mb-2"
      >
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Poor">Poor</option>
      </select>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setPhotos(Array.from(e.target.files || []))}
        className="mb-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Submit Trade-In
      </button>
    </form>
  );
}
