"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  EnvelopeIcon,
  PhoneIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  category: string;
  message: string;
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchContacts();
  }, [session, status, router, statusFilter, categoryFilter]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const response = await fetch(`/api/contact?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    searchQuery
      ? contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const statusCounts = {
    NEW: contacts.filter((c) => c.status === "NEW").length,
    READ: contacts.filter((c) => c.status === "READ").length,
    REPLIED: contacts.filter((c) => c.status === "REPLIED").length,
    RESOLVED: contacts.filter((c) => c.status === "RESOLVED").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-neutral-900 mb-2">
            Contact Submissions
          </h1>
          <p className="text-neutral-600">
            Manage and respond to customer inquiries
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "New", count: statusCounts.NEW, color: "yellow" },
            { label: "Read", count: statusCounts.READ, color: "blue" },
            { label: "Replied", count: statusCounts.REPLIED, color: "green" },
            { label: "Resolved", count: statusCounts.RESOLVED, color: "gray" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 border-2 border-neutral-200"
            >
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or subject..."
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="supplier">Supplier</option>
              <option value="mechanic">Mechanic</option>
              <option value="logistics">Logistics</option>
              <option value="grant">Grant & Funding</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact List */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
          <div className="divide-y-2 divide-neutral-100">
            {filteredContacts.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">
                          {contact.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            contact.status === "NEW"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : contact.status === "READ"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : contact.status === "REPLIED"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {contact.status}
                        </span>
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-full">
                          {contact.category}
                        </span>
                      </div>

                      <p className="text-neutral-900 font-semibold mb-1">
                        {contact.subject}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                        <span className="flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <PhoneIcon className="h-4 w-4" />
                            {contact.phone}
                          </span>
                        )}
                      </div>

                      <p className="text-neutral-600 line-clamp-2">
                        {contact.message}
                      </p>

                      <p className="text-xs text-neutral-400 mt-2">
                        {format(
                          new Date(contact.createdAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/admin/contacts/${contact.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View & Reply
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
