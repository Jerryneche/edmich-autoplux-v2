// app/support/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata = {
  title: "Support - Edmich Autoplux",
  description:
    "Get help with your orders, products, and services. Our support team is here to help you.",
};

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "You can track your order by clicking on the order in your dashboard or using the tracking ID sent to your email. Go to Dashboard → Orders → Click on any order to see real-time tracking.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We currently accept bank transfers to our designated account. Paystack integration for card payments is coming soon!",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Delivery times vary by location and supplier. Standard delivery is 3-5 business days within Lagos and 5-10 business days for other states. Express delivery options are available.",
    },
    {
      question: "Can I cancel or modify my order?",
      answer:
        "You can cancel pending orders from your dashboard. Once a supplier confirms an order, please contact support for cancellation requests.",
    },
    {
      question: "How do I become a supplier?",
      answer:
        "Click on 'Dashboard' → Select 'Supplier' role → Complete the onboarding process with your business information. Our team will verify your account within 24-48 hours.",
    },
    {
      question: "Are mechanics and logistics providers verified?",
      answer:
        "Yes! All service providers go through our verification process. Look for the verified badge on their profiles.",
    },
    {
      question: "What if I receive a damaged product?",
      answer:
        "Contact us immediately with photos of the damaged item. We'll work with the supplier to arrange a replacement or refund.",
    },
    {
      question: "How do I contact a supplier directly?",
      answer:
        "You can view supplier contact information on their product pages or in your order details after placing an order.",
    },
  ];

  const contactMethods = [
    {
      icon: PhoneIcon,
      title: "Call Us",
      description: "+234 XXX XXX XXXX",
      action: "tel:+234XXXXXXXXXX",
      actionText: "Call Now",
      color: "blue",
    },
    {
      icon: EnvelopeIcon,
      title: "Email Us",
      description: "support@edmichautoplux.com",
      action: "mailto:support@edmichautoplux.com",
      actionText: "Send Email",
      color: "purple",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "WhatsApp",
      description: "Chat with our team",
      action: "https://wa.me/234XXXXXXXXXX",
      actionText: "Start Chat",
      color: "green",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <QuestionMarkCircleIcon className="h-20 w-20 mx-auto mb-6 opacity-90" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Our support team is here to assist you with any questions or
              issues
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-blue-300 hover:shadow-xl transition-all text-center"
              >
                <div
                  className={`w-16 h-16 bg-${method.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <method.icon className={`h-8 w-8 text-${method.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-neutral-600 mb-4">{method.description}</p>
                <a
                  href={method.action}
                  className={`inline-block px-6 py-3 bg-${method.color}-600 text-white rounded-xl font-semibold hover:bg-${method.color}-700 transition-colors`}
                >
                  {method.actionText}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Business Hours & Location */}
        <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-700">
                      Monday - Friday
                    </span>
                    <span className="text-neutral-600">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-700">
                      Saturday
                    </span>
                    <span className="text-neutral-600">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold text-neutral-700">
                      Sunday
                    </span>
                    <span className="text-red-600 font-semibold">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Our Location
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-neutral-700 text-lg">
                    <strong>Edmich Autoplux</strong>
                  </p>
                  <p className="text-neutral-600">Lagos, Nigeria</p>
                  <p className="text-neutral-600">
                    Email: support@edmichautoplux.com
                  </p>
                  <p className="text-neutral-600">Phone: +234 XXX XXX XXXX</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-300 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-bold text-neutral-900 pr-8">
                    {faq.question}
                  </h3>
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is ready to assist you with any questions
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:support@edmichautoplux.com"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
              >
                Email Support
              </a>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/30 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
