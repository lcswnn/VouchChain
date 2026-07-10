"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <PrivyProvider
          appId="cmredps2j00h00cl2f4ciqlbh"
          config={{
            loginMethods: ["email", "google"],
            embeddedWallets: {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
            appearance: {
              theme: "dark",
              accentColor: "#059669", // Matching our emerald branding color
              showWalletLoginFirst: false,
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}