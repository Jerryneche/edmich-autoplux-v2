"use client";
import { useState } from "react";
import Header from "@/app/components/Header";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import Footer from "@/app/components/Footer";

export default function DriverEarningsPage() {
  const [period, setPeriod] = useState("week");

  const earnings = {
    total: 125000,
    deliveries: 42,
    avgPerDelivery: 2976,
    trend: "+15%",
  };

  const transactions = [
    {
      id: "TXN-001",
      date: "2024-01-15",
      deliveries: 8,
      amount: 24000,
      status: "paid",
    },
    {
      id: "TXN-002",
      date: "2024-01-14",
      deliveries: 6,
      amount: 18500,
      status: "paid",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Earnings</h1>
              <p className="text-gray-600">Track your income and payouts</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Download size={20} />
              Export
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            {["day", "week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <DollarSign className="text-green-600 mb-2" size={24} />
              <p className="text-3xl font-bold">
                ₦{earnings.total.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Total Earnings</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <Calendar className="text-blue-600 mb-2" size={24} />
              <p className="text-3xl font-bold">{earnings.deliveries}</p>
              <p className="text-gray-600 text-sm">Deliveries</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DollarSign className="text-purple-600 mb-2" size={24} />
              <p className="text-3xl font-bold">
                ₦{earnings.avgPerDelivery.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Avg per Delivery</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <TrendingUp className="text-yellow-600 mb-2" size={24} />
              <p className="text-3xl font-bold text-green-600">
                {earnings.trend}
              </p>
              <p className="text-gray-600 text-sm">vs Last Period</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Transaction ID</th>
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Deliveries</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{txn.id}</td>
                      <td className="py-3">{txn.date}</td>
                      <td className="py-3">{txn.deliveries}</td>
                      <td className="py-3 font-bold">
                        ₦{txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
