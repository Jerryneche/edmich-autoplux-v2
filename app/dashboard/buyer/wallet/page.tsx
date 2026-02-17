// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  reference: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchWallet();
      fetchTransactions();
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
      toast.error("Failed to load wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentUrl) {
          // Redirect to payment gateway
          if (typeof window !== "undefined") window.location.href = data.paymentUrl;
        } else {
          toast.success("Wallet funded successfully!");
          setShowFundModal(false);
          setFundAmount("");
          fetchWallet();
          fetchTransactions();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fund wallet");
      }
    } catch (error) {
      toast.error("Failed to fund wallet");
    }
  };

  if (isLoading || status === "loading") {
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

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            My Wallet
          </h1>
          <p className="text-neutral-600">
            Manage your balance and transactions
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <WalletIcon className="h-8 w-8" />
            <span className="text-lg font-medium">Available Balance</span>
          </div>
          <p className="text-5xl font-bold mb-6">
            {wallet?.currency} {wallet?.balance.toLocaleString() || "0"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFundModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Fund Wallet
            </button>
            <Link
              href="/dashboard/buyer/wallet/withdraw"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
            >
              <ArrowUpIcon className="h-5 w-5" />
              Withdraw
            </Link>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-neutral-900 mb-2">
                No transactions yet
              </p>
              <p className="text-neutral-600">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {txn.type === "credit" ? (
                        <ArrowDownIcon className="h-6 w-6 text-green-600" />
                      ) : (
                        <ArrowUpIcon className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        {txn.description ||
                          (txn.type === "credit" ? "Credit" : "Debit")}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {new Date(txn.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {txn.reference && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Ref: {txn.reference}
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      txn.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}₦
                    {txn.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Fund Wallet
            </h2>

            <form onSubmit={handleFundWallet} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  required
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You'll be redirected to a secure
                  payment page to complete this transaction.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFundModal(false)}
                  className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
