// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchWallet();
    }
  }, [status, router]);

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/wallet");
      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > wallet?.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
        }),
      });

      if (response.ok) {
        toast.success(
          "Withdrawal initiated! Funds will be sent within 24 hours."
        );
        router.push("/dashboard/buyer/wallet");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to process withdrawal");
      }
    } catch (error) {
      toast.error("Failed to process withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || !wallet) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Withdraw Funds
          </h1>
          <p className="text-neutral-600">
            Transfer money from your wallet to your bank account
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-neutral-700 mb-2">Available Balance</p>
          <p className="text-3xl font-bold text-neutral-900">
            ₦{wallet.balance.toLocaleString()}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Amount (₦) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Enter amount"
              min="100"
              max={wallet.balance}
              step="100"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Bank *
            </label>
            <select
              value={formData.bankCode}
              onChange={(e) =>
                setFormData({ ...formData, bankCode: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Bank</option>
              <option value="058">GTBank</option>
              <option value="033">UBA</option>
              <option value="011">First Bank</option>
              <option value="057">Zenith Bank</option>
              <option value="044">Access Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              maxLength={10}
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({ ...formData, accountNumber: e.target.value })
              }
              placeholder="0123456789"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> Withdrawals are processed within 24 hours
              on business days. A transaction fee may apply.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Withdraw Funds"}
          </button>
        </form>
      </section>

      <Footer />
    </main>
  );
}
