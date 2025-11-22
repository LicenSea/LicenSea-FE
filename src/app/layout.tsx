import type { Metadata } from "next";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LicenSea",
  description: "LicenSea - Decentralized Content Licensing Platform",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
