// app/legal/terms/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ShieldCheckIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function TermsOfServicePage() {
  const lastUpdated = "November 15, 2024";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Legal Agreement
              </span>
            </div>
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-neutral-600">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 mb-12">
            <h3 className="font-bold text-neutral-900 mb-4">
              Quick Navigation
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                "Acceptance of Terms",
                "User Accounts",
                "Services Offered",
                "Payment Terms",
                "User Responsibilities",
                "Prohibited Activities",
                "Intellectual Property",
                "Limitation of Liability",
                "Dispute Resolution",
                "Contact Information",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 mb-8">
              <section id="acceptance-of-terms" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  By accessing or using EDMICH ("the Platform"), you agree to be
                  bound by these Terms of Service. If you do not agree to these
                  terms, please do not use our services.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  EDMICH is a marketplace platform connecting buyers, suppliers,
                  mechanics, and logistics providers in the Nigerian automotive
                  industry. We facilitate transactions but are not directly
                  responsible for the quality of products or services provided
                  by third parties.
                </p>
              </section>

              <section id="user-accounts" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  2. User Accounts
                </h2>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  2.1 Account Creation
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                  <li>
                    You must provide accurate, current, and complete information
                    during registration
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials
                  </li>
                  <li>
                    You must be at least 18 years old to create an account
                  </li>
                  <li>You may not transfer your account to another person</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  2.2 Account Types
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>
                    <strong>Buyer Accounts:</strong> For purchasing auto parts
                    and booking services
                  </li>
                  <li>
                    <strong>Supplier Accounts:</strong> For selling auto parts
                    on the platform
                  </li>
                  <li>
                    <strong>Mechanic Accounts:</strong> For offering repair and
                    maintenance services
                  </li>
                  <li>
                    <strong>Logistics Accounts:</strong> For providing delivery
                    services
                  </li>
                </ul>
              </section>

              <section id="services-offered" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  3. Services Offered
                </h2>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  3.1 Marketplace Services
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  EDMICH provides a platform for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                  <li>Buying and selling automotive parts</li>
                  <li>Booking mechanic services</li>
                  <li>Arranging logistics and delivery</li>
                  <li>Trade-in services for used parts</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  3.2 Platform Role
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  EDMICH acts as an intermediary platform. We do not
                  manufacture, store, or directly sell automotive parts. We
                  facilitate connections between buyers and sellers but are not
                  a party to the actual transaction.
                </p>
              </section>

              <section id="payment-terms" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  4. Payment Terms
                </h2>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  4.1 Pricing
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                  <li>All prices are listed in Nigerian Naira (₦)</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Additional fees may apply for delivery and services</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  4.2 Payment Methods
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  We accept the following payment methods:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                  <li>Bank Transfer</li>
                  <li>Cash on Delivery (where available)</li>
                  <li>Online payment gateways (coming soon)</li>
                </ul>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  4.3 Refunds and Returns
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>Refund policies vary by supplier</li>
                  <li>Returns must be requested within 7 days of delivery</li>
                  <li>Products must be in original condition</li>
                  <li>Shipping costs for returns may apply</li>
                </ul>
              </section>

              <section id="user-responsibilities" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  5. User Responsibilities
                </h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  As a user of EDMICH, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>
                    Provide accurate information about yourself and your
                    business
                  </li>
                  <li>Maintain the security of your account</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Communicate respectfully with other users</li>
                  <li>Honor all commitments made through the platform</li>
                  <li>Pay for all purchases in a timely manner</li>
                  <li>Report any suspicious activity or violations</li>
                </ul>
              </section>

              <section id="prohibited-activities" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  6. Prohibited Activities
                </h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>Post false, misleading, or fraudulent listings</li>
                  <li>Sell counterfeit or stolen goods</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Attempt to circumvent platform fees</li>
                  <li>Use the platform for illegal activities</li>
                  <li>Scrape or copy content from the platform</li>
                  <li>
                    Create multiple accounts to manipulate reviews or ratings
                  </li>
                  <li>Interfere with the proper functioning of the platform</li>
                </ul>
              </section>

              <section id="intellectual-property" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  7. Intellectual Property
                </h2>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  7.1 Platform Content
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  All content on EDMICH, including but not limited to text,
                  graphics, logos, images, and software, is the property of
                  EDMICH or its licensors and is protected by Nigerian and
                  international copyright laws.
                </p>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  7.2 User Content
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  By posting content on EDMICH, you grant us a non-exclusive,
                  worldwide, royalty-free license to use, reproduce, and display
                  that content in connection with operating the platform.
                </p>
              </section>

              <section id="limitation-of-liability" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  EDMICH is provided "as is" without warranties of any kind. To
                  the maximum extent permitted by law, we disclaim all
                  warranties, express or implied.
                </p>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  We are not liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>Quality, safety, or legality of products listed</li>
                  <li>Truth or accuracy of listings</li>
                  <li>Performance of mechanics or logistics providers</li>
                  <li>Disputes between users</li>
                  <li>Indirect, incidental, or consequential damages</li>
                </ul>
              </section>

              <section id="dispute-resolution" className="mb-12">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  9. Dispute Resolution
                </h2>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  9.1 Informal Resolution
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  We encourage users to resolve disputes directly with each
                  other first. EDMICH may provide assistance in facilitating
                  communication.
                </p>

                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  9.2 Governing Law
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  These Terms are governed by the laws of the Federal Republic
                  of Nigeria. Any disputes shall be resolved in the courts of
                  Lagos State, Nigeria.
                </p>
              </section>

              <section id="contact-information" className="mb-0">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  10. Contact Information
                </h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-neutral-900 font-semibold mb-2">EDMICH</p>
                  <p className="text-neutral-700">Email: legal@edmich.ng</p>
                  <p className="text-neutral-700">Phone: +234 902 557 9441</p>
                  <p className="text-neutral-700">Address: Lagos, Nigeria</p>
                </div>
              </section>
            </div>
          </div>

          {/* Related Links */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/legal/privacy"
              className="p-6 bg-white rounded-xl border-2 border-neutral-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">
                Privacy Policy
              </h3>
              <p className="text-sm text-neutral-600">
                Learn how we protect your data
              </p>
            </Link>
            <Link
              href="/help"
              className="p-6 bg-white rounded-xl border-2 border-neutral-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">Help Center</h3>
              <p className="text-sm text-neutral-600">
                Get answers to common questions
              </p>
            </Link>
            <Link
              href="/contact"
              className="p-6 bg-white rounded-xl border-2 border-neutral-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <h3 className="font-bold text-neutral-900 mb-2">Contact Us</h3>
              <p className="text-sm text-neutral-600">
                Reach out to our support team
              </p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
