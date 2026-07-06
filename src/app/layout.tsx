import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageAnimations from "@/components/PageAnimations";
import ScrollProgress from "@/components/ScrollProgress";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/contexts/AuthContext";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://growviaconnect.com";

// Description defaults to English; the French version stays available under
// `alternates.languages` so localised previews render correctly.
const DESCRIPTION_EN = "The mentorship platform for students and young professionals";
const DESCRIPTION_FR = "La plateforme de mentorat pour étudiants et jeunes professionnels";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "GrowVia Connect",
  description: DESCRIPTION_EN,
  keywords: "mentorship, career guidance, mentoring platform, AI matching, career coaching",
  icons: {
    icon: [
      { url: "/favicon.ico",     sizes: "any" },
      { url: "/logo-icon.png",   type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple:    "/apple-touch-icon.png",
  },
  alternates: {
    languages: {
      "en": "/",
      "fr": "/",
    },
  },
  openGraph: {
    type:        "website",
    siteName:    "GrowVia Connect",
    title:       "GrowVia Connect",
    description: DESCRIPTION_EN,
    url:         APP_URL,
    locale:      "en_US",
    alternateLocale: ["fr_FR"],
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "GrowVia Connect — mentorship platform",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "GrowVia Connect",
    description: DESCRIPTION_EN,
    images:      ["/og-image.png"],
  },
};

// Silence unused-variable warning while keeping the French copy documented.
void DESCRIPTION_FR;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          #cursor-glow {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 400px;
            height: 400px;
            margin-left: -200px;
            margin-top: -200px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
            transition: width 0.4s ease, height 0.4s ease, margin 0.4s ease;
            z-index: 9999;
            will-change: left, top;
            opacity: 0;
          }
          #cursor-glow.is-hovering {
            width: 600px;
            height: 600px;
            margin-left: -300px;
            margin-top: -300px;
          }
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital@1&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+Arabic:wght@400;500;700&family=Noto+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0D0A1A] text-white">
        <div id="cursor-glow" />
        <LangProvider>
          <AuthProvider>
            <ScrollProgress />
            <Navbar />
            <PageAnimations />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </LangProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          (function () {
            var el = document.getElementById('cursor-glow');
            if (!el) return;

            var mouseX = window.innerWidth / 2;
            var mouseY = window.innerHeight / 2;
            var glowX  = mouseX;
            var glowY  = mouseY;

            function lerp(a, b, t) { return a + (b - a) * t; }

            function tick() {
              glowX = lerp(glowX, mouseX, 0.08);
              glowY = lerp(glowY, mouseY, 0.08);
              el.style.left = glowX + 'px';
              el.style.top  = glowY + 'px';
              requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);

            document.addEventListener('mousemove', function (e) {
              mouseX = e.clientX;
              mouseY = e.clientY;
              el.style.opacity = '1';
              if (e.target.closest('a, button')) {
                el.classList.add('is-hovering');
              } else {
                el.classList.remove('is-hovering');
              }
            });

            document.addEventListener('mouseleave', function () {
              el.style.opacity = '0';
            });

            document.addEventListener('mouseenter', function () {
              el.style.opacity = '1';
            });
          })();
        `}} />
      </body>
    </html>
  );
}
