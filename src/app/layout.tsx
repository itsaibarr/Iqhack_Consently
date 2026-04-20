import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consently | Your Personal Consent OS",
  description: "Map and control your digital footprint in one click.",
};

import { ConsentProvider } from "@/context/ConsentContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} antialiased selection:bg-brand-accent/30`}>
        <ConsentProvider>
          <Sidebar /> {/* Sidebar (CMD Center) */}
          <div className="pl-72">
            {children}
          </div>
        </ConsentProvider>
      </body>
    </html>
  );
}
