"use client";

import { useState } from "react";
import { QrCodeIcon } from "@heroicons/react/24/outline";

function VINScannerModal({ onClose, onSuccess }: any) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (vin.length !== 17) {
      alert("VIN must be exactly 17 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vehicles/decode-vin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
      } else {
        alert(data.error || "Failed to decode VIN");
      }
    } catch (error) {
      alert("Failed to decode VIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Scan or Enter VIN</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Identification Number
            </label>
            <input
              type="text"
              maxLength={17}
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 17-digit VIN"
            />
            <p className="text-sm text-gray-500 mt-2">
              {vin.length}/17 characters
            </p>
          </div>

          <button
            type="button"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            <QrCodeIcon className="h-5 w-5 inline mr-2" />
            Use Camera to Scan
          </button>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDecode}
              disabled={loading || vin.length !== 17}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Decoding..." : "Decode VIN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default VINScannerModal;
