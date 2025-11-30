"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { MapPin, Navigation, Phone, MessageSquare } from "lucide-react";
import Footer from "@/app/components/Footer";

export default function LogisticsNavigatePage() {
  const [deliveryStatus, setDeliveryStatus] = useState("in_transit");

  const delivery = {
    id: "DEL-12345",
    driver: "Edmich Autoplux",
    phone: "+234 902 557 9441",
    vehicleType: "Truck",
    plateNumber: "ABC-123XY",
    pickupAddress: "123 Main St, Lagos",
    deliveryAddress: "456 Oak Ave, Ikeja",
    estimatedArrival: "2:30 PM",
    currentLocation: { lat: 6.5244, lng: 3.3792 },
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Track Delivery</h1>
            <p className="text-gray-600">Delivery ID: {delivery.id}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{delivery.driver}</h3>
                <p className="text-gray-600">
                  {delivery.vehicleType} - {delivery.plateNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                  <Phone size={20} />
                </button>
                <button className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-medium">Pickup Location</p>
                  <p className="text-gray-600">{delivery.pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="font-medium">Delivery Location</p>
                  <p className="text-gray-600">{delivery.deliveryAddress}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Arrival</span>
                <span className="text-blue-600 font-bold">
                  {delivery.estimatedArrival}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Live Map</h3>
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Map integration goes here (Google Maps/Mapbox)
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
