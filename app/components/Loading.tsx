// components/ui/Loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading({
  size = "default",
  message = "Loading...",
}: {
  size?: "sm" | "default" | "lg";
  message?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-12 w-12",
    lg: "h-20 w-20",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-200/30 animate-ping" />

        {/* Main spinner */}
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600`}
          strokeWidth={3}
        />

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
      </div>

      <p className="mt-6 text-lg font-medium text-gray-700 tracking-wide">
        {message}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Please wait while we prepare your experience
      </p>
    </div>
  );
}
