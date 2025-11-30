"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "../components/Footer";
import { Package, DollarSign, Clock, TrendingUp, MapPin } from "lucide-react";

export default function DriverDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    todayDeliveries: 8,
    weeklyEarnings: 125000,
    rating: 4.7,
    completionRate: 96,
  };

  const activeDeliveries = [
    {
      id: "DEL-001",
      pickup: "123 Main St",
      delivery: "456 Oak Ave",
      amount: 5000,
      status: "picked_up",
    },
    {
      id: "DEL-002",
      pickup: "789 Pine Rd",
      delivery: "321 Elm St",
      amount: 3500,
      status: "pending",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-gray-600">Manage your deliveries and earnings</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-blue-600" size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.todayDeliveries}</p>
              <p className="text-gray-600 text-sm">Today's Deliveries</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold">
                ₦{stats.weeklyEarnings.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Weekly Earnings</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.rating}</p>
              <p className="text-gray-600 text-sm">Average Rating</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-purple-600" size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.completionRate}%</p>
              <p className="text-gray-600 text-sm">Completion Rate</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{delivery.id}</p>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          delivery.status === "picked_up"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {delivery.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-green-600">
                      ₦{delivery.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="text-gray-600">
                        Pickup: {delivery.pickup}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-green-600" />
                      <span className="text-gray-600">
                        Delivery: {delivery.delivery}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/driver/delivery/${delivery.id}`)
                    }
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                View Available Orders
              </button>
              <button className="p-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium">
                Earnings History
              </button>
              <button className="p-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
                Update Availability
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
