// app/payment/verify/page.tsx
import { Suspense } from "react";
import VerifyContent from "./VerifyContent";

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600 text-lg">
              Verifying your payment...
            </p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
