import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEINFUA",
  description: "Centro de Estudiantes de Ingenieria Informatica - UA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-neutral-900">
        <nav className="flex gap-6 border-b border-neutral-200 px-6 py-4">
          <Link href="/" className="font-semibold hover:underline">
            CEINFUA
          </Link>
          <Link href="/news" className="hover:underline">
            News
          </Link>
          <Link href="/events" className="hover:underline">
            Events
          </Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
