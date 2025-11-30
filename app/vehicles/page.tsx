"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AddVehicleModal from "../components/AddVehicleModal";
import VINScannerModal from "../components/VinScannerModal";
import {
  PlusIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

export default function VehiclesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVINScanner, setShowVINScanner] = useState(false);

  useEffect(() => {
    if (session) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch(`/api/vehicles?id=${vehicleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVehicles(vehicles.filter((v: any) => v.id !== vehicleId));
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
              <p className="text-gray-600 mt-2">
                Manage your vehicles and find compatible parts
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Vehicle
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No vehicles yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first vehicle to get personalized part recommendations
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <TruckIcon className="h-8 w-8" />
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {vehicle.year}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    {vehicle.nickname && (
                      <p className="text-blue-100 mt-1">{vehicle.nickname}</p>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      {vehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium">{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.mileage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mileage:</span>
                          <span className="font-medium">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        </div>
                      )}
                      {vehicle.engineType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Engine:</span>
                          <span className="font-medium">
                            {vehicle.engineType}
                          </span>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transmission:</span>
                          <span className="font-medium">
                            {vehicle.transmission}
                          </span>
                        </div>
                      )}
                      {vehicle.vin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIN:</span>
                          <span className="font-mono text-xs">
                            {vehicle.vin}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() =>
                          router.push(
                            `/search?make=${vehicle.make}&model=${vehicle.model}`
                          )
                        }
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition"
                      >
                        Find Parts
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchVehicles();
          }}
          onScanVIN={() => {
            setShowAddModal(false);
            setShowVINScanner(true);
          }}
        />
      )}

      {/* VIN Scanner Modal */}
      {/* VIN Scanner Modal */}
      {showVINScanner && (
        <VINScannerModal
          onClose={() => setShowVINScanner(false)}
          onSuccess={(vehicleData: any) => {
            setShowVINScanner(false);
            setShowAddModal(true);

            // Optional: Store scanned data temporarily so AddVehicleModal can use it
            // We'll pass it via a state or context later. For now, just log it:
            console.log("Scanned VIN Data:", vehicleData);

            // Later: Pass this data to AddVehicleModal
            // For now, you can store it in a state:
            // setScannedVehicleData(vehicleData);
          }}
        />
      )}
      <Footer />
    </>
  );
}
