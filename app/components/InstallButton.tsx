"use client";

import Link from "next/link";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function InstallButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isInstalled =
      standalone || (isIOS && (window.navigator as any).standalone);
    setShow(!isInstalled);
  }, []);

  if (!show) return null;

  return (
    <>
      {/* Desktop Version */}
      <Link
        href="/install"
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        Install App
      </Link>

      {/* Mobile Version */}
      <Link
        href="/install"
        className="lg:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-base font-semibold hover:shadow-lg"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        Install App
      </Link>
    </>
  );
}
