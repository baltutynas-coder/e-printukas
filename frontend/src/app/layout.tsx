import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geist = Geist({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "e.printukas.lt — Drabužiai ir tekstilė",
  description: "Kokybiški drabužiai ir tekstilė geriausiomis kainomis. Marškinėliai, polo, džemperiai, striukės.",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body className={`${geist.className} ${montserrat.variable} antialiased bg-white text-gray-900`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}