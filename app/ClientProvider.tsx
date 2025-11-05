// app/ClientProvider.tsx
//"use client";

//import { SessionProvider } from "next-auth/react";
//import { Toaster } from "react-hot-toast";
//import { ReactNode } from "react";

//export default function ClientProvider({ children }: { children: ReactNode }) {
// return (
//<SessionProvider>
//  {children}
//   <Toaster position="top-right" />
// </SessionProvider>
// );

//}

"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";
import ShoppingCartDrawer from "./components/ShoppingCartDrawer";
import { Toaster } from "react-hot-toast";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <ShoppingCartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#1f2937",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </CartProvider>
    </SessionProvider>
  );
}
