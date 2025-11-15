"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import {
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryNotes: "",
    paymentMethod: "bank_transfer",
  });

  // Bank details
  const bankDetails = {
    bankName: "Access Bank",
    accountNumber: "0084142864",
    accountName: "Chinecherem Michael Edeh",
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && status !== "loading") {
      router.push("/shop");
      toast.error("Your cart is empty");
    }
  }, [items, router, status]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!formData.address || !formData.city || !formData.state) {
      toast.error("Please complete your delivery address");
      return false;
    }
    return true;
  };

  const generateTrackingId = () => {
    const prefix = "EDM";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // Show bank details modal for bank transfer
    if (formData.paymentMethod === "bank_transfer") {
      setShowBankDetails(true);
      return;
    }

    // Process other payment methods
    await processOrder();
  };

  const processOrder = async () => {
    try {
      setIsProcessing(true);

      const shipping = 2500;
      const tax = Math.round(total * 0.075);
      const grandTotal = total + shipping + tax;
      const trackingId = generateTrackingId();

      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: grandTotal,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        deliveryNotes: formData.deliveryNotes,
        paymentMethod: formData.paymentMethod.toUpperCase().replace("_", " "),
        trackingId,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        toast.error("Server error");
        return;
      }

      if (!response.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");

      router.push(
        `/checkout/success?orderId=${data.orderId}&trackingId=${data.trackingId}&total=${grandTotal}`
      );
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const shipping = 2500;
  const tax = Math.round(total * 0.075);
  const grandTotal = total + shipping + tax;

  if (status === "loading" || items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Shopping
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Checkout
            </h1>
            <p className="text-neutral-600">
              Complete your order in a few simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Contact Information
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Lagos"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="100001"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-4 p-4 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === "bank_transfer"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
                        <p className="font-bold text-neutral-900">
                          Bank Transfer (Recommended)
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        Transfer directly to our bank account
                      </p>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-200">
                        <BanknotesIcon className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          Instant confirmation • Secure • No fees
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                      disabled
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">
                        Card Payment
                      </p>
                      <p className="text-sm text-neutral-600">
                        Coming soon - Online payment gateway
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === "cash_on_delivery"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">
                        Cash on Delivery
                      </p>
                      <p className="text-sm text-neutral-600">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBagIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-4 space-y-3">
                  <div className="flex justify-between text-neutral-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4" /> Shipping
                    </span>
                    <span className="font-semibold">
                      ₦{shipping.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Tax (7.5%)</span>
                    <span className="font-semibold">
                      ₦{tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₦{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-6 w-6" />
                      {formData.paymentMethod === "bank_transfer"
                        ? "Continue to Payment"
                        : "Place Order"}
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-neutral-600 mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BuildingLibraryIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Complete Your Payment
              </h2>
              <p className="text-neutral-600">
                Transfer ₦{grandTotal.toLocaleString()} to the account below
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Bank Name
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold text-neutral-900">
                      {bankDetails.bankName}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(bankDetails.bankName, "Bank name")
                      }
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Account Number
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-2xl font-bold text-blue-600 tracking-wider">
                      {bankDetails.accountNumber}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          bankDetails.accountNumber,
                          "Account number"
                        )
                      }
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                    Account Name
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold text-neutral-900">
                      {bankDetails.accountName}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(bankDetails.accountName, "Account name")
                      }
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Please use your order reference when making the transfer
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={processOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Confirming Order...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    I've Made the Transfer
                  </>
                )}
              </button>

              <button
                onClick={() => setShowBankDetails(false)}
                className="w-full px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-center text-neutral-600 mt-4">
              Your order will be confirmed once payment is received (usually
              within 5-10 minutes)
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
