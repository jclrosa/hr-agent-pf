import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import AuthHeaderButton from "./components/AuthHeaderButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeopleFunction | Smarter HR for Startups",
  description: "AI-powered HR guidance and templates for startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur sticky top-0 z-20">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">People Function</Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition">Pricing</Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-700 transition">HR Agent</Link>
            </div>
            <AuthHeaderButton />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
