import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "GrowVia – Bringing Clarity to Your Future",
  description:
    "Connect with experienced mentors who truly understand your journey. Career guidance, AI-powered matching, and structured mentoring for the next generation.",
  keywords: "mentorship, career guidance, mentoring platform, AI matching, career coaching",
  openGraph: {
    title: "GrowVia – Bringing Clarity to Your Future",
    description: "Connect with experienced mentors who truly understand your journey.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
