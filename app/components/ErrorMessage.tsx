// components/ui/ErrorMessage.tsx
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorMessage({
  title = "Something went wrong",
  message = "We couldn't complete your request. Please try again.",
  action,
  onRetry,
}: {
  title?: string;
  message?: string;
  action?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full blur-3xl bg-red-500/20 animate-pulse" />

        {/* Main icon */}
        <div className="relative bg-white rounded-full p-6 shadow-2xl border-4 border-red-100">
          <AlertCircle className="h-16 w-16 text-red-600" strokeWidth={2.5} />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h3>

      <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <RefreshCw className="h-5 w-5 group-hover:animate-spin" />
          {action || "Try Again"}
        </button>
      )}
    </div>
  );
}
