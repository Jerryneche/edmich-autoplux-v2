"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  CreditCardIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string | null;
  expiryMonth: string | null;
  expiryYear: string | null;
  bankName: string | null;
  accountNumber: string | null;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"card" | "bank">("card");

  const [formData, setFormData] = useState({
    type: "card",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchPaymentMethods();
    }
  }, [status, router]);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.methods || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: addType,
          ...(addType === "card"
            ? {
                last4: formData.cardNumber.slice(-4),
                expiryMonth: formData.expiryMonth,
                expiryYear: formData.expiryYear,
              }
            : {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
              }),
        }),
      });

      if (response.ok) {
        toast.success("Payment method added!");
        setShowAddModal(false);
        setFormData({
          type: "card",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
          bankName: "",
          accountNumber: "",
          accountName: "",
        });
        fetchPaymentMethods();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add payment method");
      }
    } catch (error) {
      toast.error("Failed to add payment method");
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(
        `/api/payment-methods/${methodId}/set-default`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        toast.success("Default payment method updated!");
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error("Failed to update default method");
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?"))
      return;

    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Payment method deleted!");
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error("Failed to delete payment method");
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Payment Methods
            </h1>
            <p className="text-neutral-600">
              Manage your saved payment methods
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add New
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <CreditCardIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No payment methods
            </p>
            <p className="text-neutral-600 mb-6">
              Add a card or bank account to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  method.isDefault
                    ? "border-blue-500 shadow-lg"
                    : "border-neutral-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      {method.type === "card" ? (
                        <>
                          <p className="font-bold text-neutral-900">
                            •••• •••• •••• {method.last4}
                          </p>
                          <p className="text-sm text-neutral-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-neutral-900">
                            {method.bankName}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {method.accountNumber}
                          </p>
                        </>
                      )}
                      {method.isDefault && (
                        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          <CheckCircleIcon className="h-4 w-4" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Add Payment Method
            </h2>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setAddType("card")}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  addType === "card"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setAddType("bank")}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  addType === "bank"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Bank Account
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              {addType === "card" ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: e.target.value })
                      }
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Month
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.expiryMonth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryMonth: e.target.value,
                          })
                        }
                        placeholder="MM"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.expiryYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryYear: e.target.value,
                          })
                        }
                        placeholder="YY"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      placeholder="e.g., GTBank"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="0123456789"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add Method
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
