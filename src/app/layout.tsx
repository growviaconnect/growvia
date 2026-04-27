import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollProgress from "@/components/ScrollProgress";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "GrowVia – Find the mentor who's been exactly where you want to go",
  description:
    "GrowVia matches ambitious students and young professionals with experienced mentors through AI — in minutes, not months.",
  keywords: "mentorship, career guidance, mentoring platform, AI matching, career coaching",
  openGraph: {
    title: "GrowVia – Find the mentor who's been exactly where you want to go",
    description: "GrowVia matches ambitious students and young professionals with experienced mentors through AI — in minutes, not months.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital@1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0D0A1A] text-white">
        <LangProvider>
          <AuthProvider>
            <ScrollProgress />
            <Navbar />
            <ScrollReveal />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
