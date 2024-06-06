import type { Metadata } from "next";
import { Inter, Comfortaa } from "next/font/google";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import Footer from "@/components/Footer";

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
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
