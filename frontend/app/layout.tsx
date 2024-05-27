import type { Metadata } from "next";
import { Inter, Comfortaa } from "next/font/google";

import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoinFlip",
  description: "CoinFlip by 0xNascosta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={comfortaa.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
