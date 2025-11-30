"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Search, MapPin, Clock, DollarSign, Star, Truck } from "lucide-react";

export default function FindLogisticsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const logistics = [
    {
      id: 1,
      name: "Swift Cargo Services",
      rating: 4.8,
      reviews: 234,
      vehicleType: "Truck",
      capacity: "5 tons",
      pricePerKm: 50,
      eta: "30 mins",
      distance: "2.3 km",
      available: true,
    },
    {
      id: 2,
      name: "Express Delivery Co",
      rating: 4.6,
      reviews: 189,
      vehicleType: "Van",
      capacity: "2 tons",
      pricePerKm: 35,
      eta: "15 mins",
      distance: "1.1 km",
      available: true,
    },
  ];

  const handleBook = (logisticId: number) => {
    router.push(`/logistics/book/${logisticId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Logistics Services</h1>
            <p className="text-gray-600">
              Book reliable delivery services near you
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by service name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {["all", "truck", "van", "bike", "available"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            {logistics.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star
                        className="text-yellow-500 fill-yellow-500"
                        size={16}
                      />
                      <span className="font-semibold">{service.rating}</span>
                      <span>({service.reviews} reviews)</span>
                    </div>
                  </div>
                  {service.available && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Available
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Truck size={20} />
                    <span>
                      {service.vehicleType} - {service.capacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign size={20} />
                    <span>₦{service.pricePerKm}/km</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={20} />
                    <span>ETA: {service.eta}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={20} />
                    <span>{service.distance} away</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBook(service.id)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
