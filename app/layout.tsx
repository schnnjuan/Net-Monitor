import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/lib/LanguageContext";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Net Monitor",
  description: "Real-time dashboard for global internet outages, censorship, and cyberattacks.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased bg-black text-white font-mono selection:bg-white selection:text-black`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
