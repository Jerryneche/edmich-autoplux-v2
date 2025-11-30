"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AddPaymentMethodModal from "../components/AddPaymentMethodModal";
import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function PaymentMethodsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (session) {
      fetchPaymentMethods();
    }
  }, [session]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment/methods");
      const data = await response.json();

      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;

    try {
      const response = await fetch(`/api/payment/methods?id=${methodId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter((m: any) => m.id !== methodId));
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Payment Methods
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your saved payment methods
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Add Payment Method
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No payment methods
              </h3>
              <p className="text-gray-600 mb-6">
                Add a payment method for faster checkout
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add Your First Payment Method
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method: any) => (
                <div
                  key={method.id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {method.type === "card"
                            ? `•••• ${method.last4}`
                            : method.bankName}
                        </h3>
                        {method.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      {method.type === "card" && (
                        <p className="text-sm text-gray-600">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      )}
                      {method.type === "bank" && (
                        <p className="text-sm text-gray-600">
                          {method.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(method.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPaymentMethodModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchPaymentMethods();
          }}
        />
      )}

      <Footer />
    </>
  );
}
