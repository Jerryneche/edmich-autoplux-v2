"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";

type SmartCTAProps = {
  role?: "supplier" | "mechanic" | "logistics";
  children: React.ReactNode;
  className?: string;
} & (
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
  | React.ButtonHTMLAttributes<HTMLButtonElement>
);

const SmartCTA = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  SmartCTAProps
>(({ role, children, className = "", ...props }, ref) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state — prevent layout shift
  if (status === "loading") {
    return (
      <span
        className={`inline-block px-8 py-4 bg-gray-300 rounded-xl animate-pulse ${className}`}
        aria-hidden="true"
      >
        {children}
      </span>
    );
  }

  // User is logged in → show "Go to Dashboard"
  if (session) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/dashboard");
    };

    return (
      <button
        onClick={handleClick}
        className={className}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        Go to Dashboard
      </button>
    );
  }

  // User is NOT logged in → go to signup with role
  const signupUrl = role ? `/signup?role=${role}` : "/signup";

  return (
    <Link
      href={signupUrl}
      className={className}
      ref={ref as React.Ref<HTMLAnchorElement>}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </Link>
  );
});

SmartCTA.displayName = "SmartCTA";

export default SmartCTA;
