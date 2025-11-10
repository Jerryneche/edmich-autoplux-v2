// app/checkout/success/page.tsx
// app/checkout/success/page.tsx
import { Suspense } from "react";
import SuccessContent from "./SuccessContent";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white">
      <Header />
      <div className="pt-24 pb-16">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
