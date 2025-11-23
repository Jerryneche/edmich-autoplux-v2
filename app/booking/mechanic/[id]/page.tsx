"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface BookingContext {
  orderId: string;
  trackingId: string;
  returnUrl: string;
}

export default function MechanicBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mechanicId = params.id as string;

  const [mechanic, setMechanic] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingContext, setBookingContext] = useState<BookingContext | null>(
    null
  );

  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    locationType: "WORKSHOP" as "WORKSHOP" | "HOME",
    phone: "",
  });

  // Load booking context from sessionStorage (set by tracking modal)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = sessionStorage.getItem("bookingContext");
      if (context) {
        const parsed = JSON.parse(context);
        setBookingContext(parsed);
      }
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch mechanic
  useEffect(() => {
    if (status === "loading" || !mechanicId) return;

    const fetchMechanic = async () => {
      try {
        const response = await fetch(`/api/mechanic/${mechanicId}`);
        if (response.ok) {
          const data = await response.json();
          setMechanic(data);
        } else {
          toast.error("Mechanic not found");
        }
      } catch (error) {
        console.error("Error fetching mechanic:", error);
        toast.error("Failed to load mechanic details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMechanic();
  }, [status, mechanicId]);

  const calculateEstimate = () => {
    if (!mechanic?.hourlyRate) return 0;
    const baseRate = parseFloat(mechanic.hourlyRate.toString());
    const multiplier = formData.locationType === "HOME" ? 1.5 : 1;
    return baseRate * multiplier;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const estimatedPrice = calculateEstimate();
    if (!estimatedPrice || isNaN(estimatedPrice)) {
      toast.error("Invalid estimated price");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      mechanicId,
      vehicleMake: formData.vehicleMake,
      vehicleModel: formData.vehicleModel,
      vehicleYear: formData.vehicleYear,
      serviceType: formData.serviceType,
      customService:
        formData.serviceType === "Other" ? formData.description : null,
      estimatedPrice,
      date: formData.preferredDate,
      time: formData.preferredTime,
      location: formData.locationType,
      address: formData.location,
      city: mechanic?.city || "Unknown",
      state: mechanic?.state || null,
      phone: formData.phone,
      additionalNotes: formData.description,
    };

    try {
      // Step 1: Create the mechanic booking
      const response = await fetch("/api/bookings/mechanic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = "Failed to submit booking";
        try {
          const err = JSON.parse(text);
          errorMsg = err.error || errorMsg;
        } catch {}
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const booking = await response.json();
      console.log("Booking created:", booking);

      // Step 2: If this is for an order, create service link
      if (bookingContext?.orderId) {
        console.log("Creating service link for order:", bookingContext.orderId);

        const linkResponse = await fetch(
          `/api/orders/${bookingContext.orderId}/service-links`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              type: "MECHANIC",
            }),
          }
        );

        if (!linkResponse.ok) {
          console.error("Failed to create service link");
          toast.error("Booking created but failed to link to order");
        } else {
          console.log("Service link created successfully");
        }
      }

      // Step 3: Clean up and redirect
      toast.success("Mechanic service booked successfully!");
      sessionStorage.removeItem("bookingContext");

      setTimeout(() => {
        if (bookingContext?.returnUrl) {
          router.push(bookingContext.returnUrl);
        } else {
          router.push("/dashboard/buyer/bookings");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Network error:", error);
      toast.error("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!mechanic) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Mechanic not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Services
          </button>

          {/* Linked Order Banner */}
          {bookingContext && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBagIcon className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-900">
                    This service is for your order
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xl font-bold text-blue-700">
                      {bookingContext.orderId}
                    </span>
                    <span className="text-sm text-gray-600">
                      Tracking: {bookingContext.trackingId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Book Mechanic Service
                </h1>
                <p className="text-gray-600 mb-8">
                  Fill in the details below to book your service
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                      Vehicle Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Type *
                        </label>
                        <select
                          required
                          value={formData.vehicleType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicleType: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Truck">Truck</option>
                          <option value="Van">Van</option>
                          <option value="Motorcycle">Motorcycle</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Make *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Toyota"
                          value={formData.vehicleMake}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicleMake: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Camry"
                          value={formData.vehicleModel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicleModel: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g., 2020"
                          value={formData.vehicleYear}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vehicleYear: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                      Service Details
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type *
                      </label>
                      <select
                        required
                        value={formData.serviceType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select service</option>
                        <option value="General Maintenance">
                          General Maintenance
                        </option>
                        <option value="Engine Repair">Engine Repair</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Transmission">Transmission</option>
                        <option value="Electrical">Electrical</option>
                        <option value="AC Repair">AC Repair</option>
                        <option value="Body Work">Body Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe the issue..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08012345678"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                      Schedule
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.preferredDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferredDate: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.preferredTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferredTime: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                      Service Location
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Type *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {["WORKSHOP", "HOME"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                locationType: type as any,
                              })
                            }
                            className={`p-4 border-2 rounded-lg transition-all ${
                              formData.locationType === type
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <p className="font-medium">
                              {type === "WORKSHOP"
                                ? "Workshop"
                                : "Home Service"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {type === "WORKSHOP"
                                ? "Standard rate"
                                : "+50% rate"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full address"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Mechanic Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Business</p>
                    <p className="font-semibold">{mechanic.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>
                      {mechanic.city}, {mechanic.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p>{mechanic.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mechanic.specialization?.map((s: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Estimated Cost</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₦{calculateEstimate().toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Base: ₦{mechanic.hourlyRate?.toLocaleString()}/hr
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <a
                      href={`tel:${mechanic.phone}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Call Mechanic
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
