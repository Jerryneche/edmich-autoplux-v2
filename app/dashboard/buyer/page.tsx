"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

import Image from "next/image";
import {
  ShoppingBagIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  WalletIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  EyeIcon,
  ArrowRightIcon,
  CubeIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  trackingId: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    city: string;
    state: string;
  } | null;
  type: "ORDER";
}

interface MechanicBooking {
  id: string;
  serviceType: string;
  vehicleMake: string;
  vehicleModel: string;
  pickupAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  status: string;
  createdAt: string;
  mechanic?: {
    companyName?: string;
    businessName?: string;
  };
  type: "MECHANIC";
}

interface LogisticsBooking {
  id: string;
  trackingNumber: string;
  packageType: string;
  pickupAddress?: string;
  pickupCity?: string;
  deliveryCity?: string;
  status: string;
  createdAt: string;
  driver?: {
    companyName?: string;
  };
  type: "LOGISTICS";
}

type ActivityItem = Order | MechanicBooking | LogisticsBooking;

interface Stats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  pendingOrders: number;
  mechanicBookings: number;
  logisticsBookings: number;
}

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    mechanicBookings: 0,
    logisticsBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "BUYER") {
      router.push("/dashboard");
      return;
    }

    fetchAllData();
  }, [session, status, router]);

  const fetchAllData = async () => {
    try {
      const [ordersRes, mechanicRes, logisticsRes] = await Promise.all([
        fetch("/api/orders/user"),
        fetch("/api/bookings/mechanics?view=customer"),
        fetch("/api/bookings/logistics?view=customer"),
      ]);

      const orders: Order[] = ordersRes.ok ? await ordersRes.json() : [];
      const mechanics: MechanicBooking[] = mechanicRes.ok
        ? await mechanicRes.json()
        : [];
      const logistics: LogisticsBooking[] = logisticsRes.ok
        ? await logisticsRes.json()
        : [];

      const allActivities: ActivityItem[] = [
        ...orders.map((o) => ({ ...o, type: "ORDER" } as Order)),
        ...mechanics.map(
          (m) => ({ ...m, type: "MECHANIC" } as MechanicBooking)
        ),
        ...logistics.map(
          (l) => ({ ...l, type: "LOGISTICS" } as LogisticsBooking)
        ),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setActivities(allActivities);
      calculateStats(orders, mechanics, logistics);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (
    orders: Order[],
    mechanics: MechanicBooking[],
    logistics: LogisticsBooking[]
  ) => {
    const total = orders.length;
    const active = orders.filter(
      (o) =>
        o.status === "PENDING" ||
        o.status === "CONFIRMED" ||
        o.status === "SHIPPED"
    ).length;
    const completed = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;

    setStats({
      totalOrders: total,
      activeOrders: active,
      completedOrders: completed,
      pendingOrders: pending,
      mechanicBookings: mechanics.length,
      logisticsBookings: logistics.length,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return ShoppingBagIcon;
      case "MECHANIC":
        return WrenchScrewdriverIcon;
      case "LOGISTICS":
        return TruckIcon;
      default:
        return CubeIcon;
    }
  };

  const getActivityTitle = (item: ActivityItem) => {
    if (item.type === "ORDER") {
      return `${item.items?.length || 0} item(s) ordered`;
    }
    if (item.type === "MECHANIC") {
      const booking = item as MechanicBooking;
      return `${booking.serviceType || "Service"} for ${
        booking.vehicleMake || "Vehicle"
      }`;
    }
    if (item.type === "LOGISTICS") {
      return `Delivery: ${(item as LogisticsBooking).packageType || "Package"}`;
    }
    return "Activity";
  };

  const getActivityLink = (item: ActivityItem) => {
    if (item.type === "ORDER") return `/dashboard/buyer/orders`;
    if (item.type === "MECHANIC")
      return `/dashboard/buyer/bookings?type=mechanics`;
    if (item.type === "LOGISTICS")
      return `/dashboard/buyer/bookings?type=logistics`;
    return "#";
  };

  const statsData = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      color: "blue",
      link: "/dashboard/buyer/orders",
    },
    {
      label: "Mechanic Bookings",
      value: stats.mechanicBookings,
      icon: WrenchScrewdriverIcon,
      color: "purple",
      link: "/dashboard/buyer/bookings?type=mechanics",
    },
    {
      label: "Logistics Deliveries",
      value: stats.logisticsBookings,
      icon: TruckIcon,
      color: "green",
      link: "/dashboard/buyer/bookings?type=logistics",
    },
    {
      label: "Pending Actions",
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: "orange",
      link: "/dashboard/buyer/orders",
    },
  ];

  if (isLoading || status === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                Welcome back, {session?.user?.name}!
              </h1>
              <p className="text-lg text-neutral-600">
                Track your orders, services, and deliveries in one place
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, i) => (
            <Link
              key={i}
              href={stat.link}
              className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
                </div>
                <ArrowRightIcon className="h-5 w-5 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Activity
            </h2>
            {activities.length > 0 && (
              <Link
                href="/dashboard/buyer/orders"
                className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                View All
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.slice(0, 6).map((item) => {
                const Icon = getActivityIcon(item.type);
                return (
                  <Link
                    key={item.id}
                    href={getActivityLink(item)}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl hover:bg-neutral-100 hover:shadow-md transition-all border-2 border-transparent hover:border-blue-200">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.type === "ORDER" &&
                          item.items?.[0]?.product?.image ? (
                            <Image
                              src={item.items[0].product.image}
                              alt={item.items[0].product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="h-8 w-8 text-neutral-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-bold text-blue-600">
                              {(item.type === "ORDER" &&
                                (item as Order).trackingId) ||
                                (item.type === "LOGISTICS" &&
                                  (item as LogisticsBooking).trackingNumber) ||
                                item.id.slice(-8).toUpperCase()}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {formatStatus(item.status)}
                            </span>
                          </div>
                          <h3 className="font-bold text-neutral-900 mb-1">
                            {getActivityTitle(item)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            {item.type === "MECHANIC" &&
                              (item as MechanicBooking).mechanic && (
                                <span className="flex items-center gap-1">
                                  <WrenchScrewdriverIcon className="h-4 w-4" />
                                  {(item as MechanicBooking).mechanic
                                    ?.companyName ||
                                    (item as MechanicBooking).mechanic
                                      ?.businessName ||
                                    "Mechanic"}
                                </span>
                              )}
                            {item.type === "LOGISTICS" &&
                              (item as LogisticsBooking).driver && (
                                <span className="flex items-center gap-1">
                                  <TruckIcon className="h-4 w-4" />
                                  {(item as LogisticsBooking).driver
                                    ?.companyName || "Driver"}
                                </span>
                              )}
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {item.type === "ORDER" && (
                          <div className="text-right">
                            <p className="text-sm text-neutral-600 mb-1">
                              Total
                            </p>
                            <p className="font-bold text-neutral-900 text-xl">
                              ₦{(item as Order).total.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <EyeIcon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBagIcon className="h-12 w-12 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                No activity yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
                Start shopping, book a mechanic, or send a package
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  Shop Now
                </Link>
                <Link
                  href="/business/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                  Book Service
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/buyer/bookings?type=mechanics"
            className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-xl transition-all"
          >
            <WrenchScrewdriverIcon className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">
              Mechanic Bookings
            </h3>
            <p className="text-sm text-neutral-600">
              Track your service requests
            </p>
          </Link>

          <Link
            href="/dashboard/buyer/bookings?type=logistics"
            className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-xl transition-all"
          >
            <TruckIcon className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">
              Logistics Deliveries
            </h3>
            <p className="text-sm text-neutral-600">
              Monitor your package status
            </p>
          </Link>

          <Link
            href="/support"
            className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-xl transition-all"
          >
            <HeartIcon className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">Need Help?</h3>
            <p className="text-sm text-neutral-600">We're here 24/7</p>
          </Link>
          <Link
            href="/dashboard/buyer/addresses"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-neutral-200 hover:border-blue-500 transition-all"
          >
            <MapPinIcon className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-bold text-neutral-900">My Addresses</p>
              <p className="text-sm text-neutral-600">
                Manage delivery addresses
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/buyer/payment-methods"
            className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <CreditCardIcon className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">Payment Methods</h3>
            <p className="text-sm text-neutral-600">
              Manage cards & bank accounts
            </p>
          </Link>

          <Link
            href="/dashboard/buyer/wallet"
            className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <WalletIcon className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">My Wallet</h3>
            <p className="text-sm text-neutral-600">
              View balance & transactions
            </p>
          </Link>

          <Link
            href="/dashboard/kyc/status"
            className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <DocumentTextIcon className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-bold text-neutral-900 mb-1">
              KYC Verification
            </h3>
            <p className="text-sm text-neutral-600">Verify your account</p>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
