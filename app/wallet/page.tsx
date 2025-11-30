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
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function WalletPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (session) {
      fetchWallet();
      fetchTransactions();
    }
  }, [session, filter]);

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

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/wallet/transactions?type=${filter}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  const totalCredit = transactions
    .filter((t: any) => t.type === "credit")
    .reduce((sum, t: any) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t: any) => t.type === "debit")
    .reduce((sum, t: any) => sum + t.amount, 0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <WalletIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Available Balance</p>
                  <h2 className="text-4xl font-bold">
                    ₦{wallet?.balance?.toLocaleString() || "0"}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => router.push("/wallet/withdraw")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition"
              >
                Withdraw Funds
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownIcon className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-blue-100">Total Credit</span>
                </div>
                <p className="text-xl font-bold">
                  ₦{totalCredit.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpIcon className="h-4 w-4 text-red-300" />
                  <span className="text-sm text-blue-100">Total Debit</span>
                </div>
                <p className="text-xl font-bold">
                  ₦{totalDebit.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BanknotesIcon className="h-4 w-4 text-blue-300" />
                  <span className="text-sm text-blue-100">Transactions</span>
                </div>
                <p className="text-xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Transaction History
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["all", "credit", "debit"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize ${
                      filter === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <WalletIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-600">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpIcon className="h-5 w-5 text-red-600" />
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {transaction.description}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </span>
                            {transaction.reference && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-xs">
                                  {transaction.reference}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₦
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
