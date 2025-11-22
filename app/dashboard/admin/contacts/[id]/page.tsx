"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
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
  repliedBy: string | null;
  createdAt: string;
}

export default function ContactDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [contact, setContact] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

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
    fetchContact();
  }, [session, status, router, id]);

  const fetchContact = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/contacts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      } else {
        toast.error("Contact not found");
        router.push("/dashboard/admin/contacts");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error("Please write a reply");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/contacts/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });

      if (response.ok) {
        toast.success("Reply sent successfully!");
        setReply("");
        fetchContact();
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status updated");
        fetchContact();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (!contact) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        <Link
          href="/dashboard/admin/contacts"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Contacts
        </Link>

        <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-xl mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-neutral-900">
                  {contact.name}
                </h1>
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
              <p className="text-sm text-neutral-500">
                Submitted{" "}
                {format(new Date(contact.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <select
              value={contact.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="px-4 py-2 border-2 border-neutral-200 rounded-xl font-semibold text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
              <EnvelopeIcon className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="text-xs text-neutral-500 mb-1">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {contact.phone && (
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <PhoneIcon className="h-5 w-5 text-neutral-600" />
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Phone</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-neutral-500 mb-2">Subject</p>
            <p className="text-xl font-bold text-neutral-900">
              {contact.subject}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-neutral-500 mb-2">Message</p>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <p className="text-neutral-900 whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(
                contact.subject
              )}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Reply via Email
            </a>

            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Call Customer
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-xl">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Send Reply via Platform
          </h2>
          <form onSubmit={handleSendReply}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Your Reply
              </label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply here..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !reply.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Send Reply
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
