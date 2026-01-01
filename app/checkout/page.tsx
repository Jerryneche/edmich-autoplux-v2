// app/checkout/page.tsx
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
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryNotes: "",
    paymentMethod: "paystack", // Default to Paystack
    saveAddress: false,
    setAsDefault: false,
  });

  const bankDetails = {
    bankName: "Access Bank",
    accountNumber: "0084142864",
    accountName: "Chinecherem Michael Edeh",
  };

  useEffect(() => {
    if (items.length === 0 && status !== "loading") {
      router.push("/shop");
      toast.error("Your cart is empty");
    }
  }, [items, router, status]);

  useEffect(() => {
    if (session?.user) {
      fetchSavedAddresses();
      setFormData((prev) => ({ ...prev, email: session.user?.email || "" }));
    }
  }, [session]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data);
        const defaultAddr = data.find((addr: SavedAddress) => addr.isDefault);
        if (defaultAddr) selectAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const selectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode || "",
      email: session?.user?.email || prev.email || "",
    }));
    setShowNewAddressForm(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    toast.success(`${label} copied!`);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // For bank transfer, show bank details
    if (formData.paymentMethod === "bank_transfer") {
      setShowBankDetails(true);
      return;
    }

    // For Paystack or cash on delivery
    await processOrder();
  };

  const processOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const shipping = 2500;
      const tax = Math.round(total * 0.075);
      const grandTotal = total + shipping + tax;
      const trackingId = generateTrackingId();

      // Save address if requested
      if (formData.saveAddress && session?.user) {
        try {
          await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              isDefault: formData.setAsDefault,
            }),
          });
        } catch (err) {
          console.error("Error saving address:", err);
        }
      }

      // Create order
      const orderPayload = {
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
        paymentMethod: formData.paymentMethod.toUpperCase(),
        trackingId,
        paymentStatus:
          formData.paymentMethod === "cash_on_delivery" ? "PENDING" : "PENDING",
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();

        if (errorData.insufficientStock) {
          const stockMessage = errorData.insufficientStock
            .map(
              (item: any) =>
                `${item.productName}: Only ${item.availableStock} available`
            )
            .join("\n");
          toast.error(`Insufficient Stock!\n${stockMessage}`, {
            duration: 8000,
          });
          setShowBankDetails(false);
          return;
        }

        toast.error(errorData.message || "Failed to place order");
        return;
      }

      const orderData = await orderResponse.json();

      // If Paystack, initialize payment
      if (formData.paymentMethod === "paystack") {
        const paymentResponse = await fetch("/api/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            amount: grandTotal,
            email: formData.email,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.authorization_url) {
          // Redirect to Paystack checkout
          window.location.href = paymentData.authorization_url;
          return;
        } else {
          toast.error("Failed to initialize payment");
          return;
        }
      }

      // For cash on delivery or bank transfer confirmation
      clearCart();
      toast.success("Order placed successfully! 🎉");

      router.push(
        `/checkout/success?orderId=${orderData.orderId}&trackingId=${orderData.trackingId}&total=${grandTotal}`
      );
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("Network error. Please try again.");
      setShowBankDetails(false);
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
            <div className="lg:col-span-2 space-y-6">
              {/* Saved Addresses */}
              {session?.user &&
                savedAddresses.length > 0 &&
                !showNewAddressForm && (
                  <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <MapPinIcon className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">
                          Saved Addresses
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          setShowNewAddressForm(true);
                          setSelectedAddressId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        New Address
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => selectAddress(addr)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            selectedAddressId === addr.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-neutral-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-neutral-900">
                              {addr.fullName}
                            </p>
                            {selectedAddressId === addr.id && (
                              <CheckIcon className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-1">
                            {addr.address}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {addr.city}, {addr.state}
                          </p>
                          <p className="text-sm text-neutral-600 mt-2">
                            {addr.phone}
                          </p>
                          {addr.isDefault && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              Default
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <>
                  <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">
                          Contact Information
                        </h2>
                      </div>
                      {session?.user && savedAddresses.length > 0 && (
                        <button
                          onClick={() => {
                            setShowNewAddressForm(false);
                            const defaultAddr = savedAddresses.find(
                              (a) => a.isDefault
                            );
                            if (defaultAddr) selectAddress(defaultAddr);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Cancel
                        </button>
                      )}
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

                      {session?.user && (
                        <div className="border-t border-neutral-200 pt-4 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="saveAddress"
                              checked={formData.saveAddress}
                              onChange={handleInputChange}
                              className="w-5 h-5 text-blue-600 rounded border-2 border-neutral-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-neutral-700">
                              Save this address for future orders
                            </span>
                          </label>

                          {formData.saveAddress && (
                            <label className="flex items-center gap-3 cursor-pointer ml-8">
                              <input
                                type="checkbox"
                                name="setAsDefault"
                                checked={formData.setAsDefault}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded border-2 border-neutral-300 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-neutral-700">
                                Set as default address
                              </span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Payment Method */}
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
                  {/* Paystack - Card/Bank Transfer */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === "paystack"
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={formData.paymentMethod === "paystack"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                        <p className="font-bold text-neutral-900">
                          Pay with Paystack
                        </p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        Card, Bank Transfer, USSD, Mobile Money
                      </p>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png"
                          alt="Visa"
                          className="h-6"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png"
                          alt="Mastercard"
                          className="h-6"
                        />
                        <img
                          src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png"
                          alt="Paystack"
                          className="h-6 bg-blue-600 rounded px-1"
                        />
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer (Manual) */}
                  <label
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === "bank_transfer"
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-200 hover:border-blue-300"
                    }`}
                  >
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
                          Direct Bank Transfer
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600">
                        Transfer directly to our bank account
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === "cash_on_delivery"
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === "cash_on_delivery"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BanknotesIcon className="h-5 w-5 text-green-600" />
                        <p className="font-semibold text-neutral-900">
                          Cash on Delivery
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
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
                      {formData.paymentMethod === "paystack"
                        ? "Pay Now"
                        : formData.paymentMethod === "bank_transfer"
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
              <p className="text-sm text-yellow-800 font-medium text-center">
                ⚠️ Click "I've Made the Transfer" after payment
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={processOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Order...
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
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
