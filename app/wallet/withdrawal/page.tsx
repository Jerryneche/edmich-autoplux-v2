"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function WithdrawPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    bankCode: "",
    accountNumber: "",
  });

  const banks = [
    { code: "044", name: "Access Bank" },
    { code: "023", name: "Citibank" },
    { code: "050", name: "Ecobank" },
    { code: "214", name: "FCMB" },
    { code: "070", name: "Fidelity Bank" },
    { code: "011", name: "First Bank" },
    { code: "058", name: "GTBank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "526", name: "Parallex Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "101", name: "Providus Bank" },
    { code: "221", name: "Stanbic IBTC" },
    { code: "068", name: "Standard Chartered" },
    { code: "232", name: "Sterling Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "032", name: "Union Bank" },
    { code: "033", name: "UBA" },
    { code: "215", name: "Unity Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
  ];

  useEffect(() => {
    if (session) {
      fetchWallet();
    }
  }, [session]);

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();

      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);

    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > wallet?.balance) {
      alert("Insufficient balance");
      return;
    }

    if (amount < 100) {
      alert("Minimum withdrawal amount is ₦100");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Withdrawal request submitted successfully!");
        router.push("/wallet");
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      alert("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/wallet")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Wallet
          </button>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Withdraw Funds
                </h1>
                <p className="text-gray-600">
                  Available: ₦{wallet?.balance?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="100"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Minimum withdrawal: ₦100
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank *
                </label>
                <select
                  required
                  value={formData.bankCode}
                  onChange={(e) =>
                    setFormData({ ...formData, bankCode: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose your bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0123456789"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Withdrawal Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      ₦{formData.amount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium">₦0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-900">
                      You'll Receive:
                    </span>
                    <span className="font-bold text-blue-900">
                      ₦{formData.amount || "0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Withdrawals are processed within 24
                  hours on business days. Please ensure your account details are
                  correct.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/wallet")}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Withdraw Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
