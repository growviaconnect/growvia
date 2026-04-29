import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollRevealEnhanced from "@/components/ScrollRevealEnhanced";
import ScrollProgress from "@/components/ScrollProgress";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "GrowVia – Find the mentor who's been exactly where you want to go",
  description:
    "GrowVia matches ambitious students and young professionals with experienced mentors through AI, in minutes, not months.",
  keywords: "mentorship, career guidance, mentoring platform, AI matching, career coaching",
  openGraph: {
    title: "GrowVia – Find the mentor who's been exactly where you want to go",
    description: "GrowVia matches ambitious students and young professionals with experienced mentors through AI, in minutes, not months.",
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital@1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0D0A1A] text-white">
        <div id="cursor-glow" />
        <LangProvider>
          <AuthProvider>
            <ScrollProgress />
            <Navbar />
            <ScrollReveal />
            <ScrollRevealEnhanced />
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
