import Link from "next/link";

const footerLinks = [
  { href: "/how-it-works", label: "Explore" },
  { href: "/who-we-are", label: "Founders" },
  { href: "/for-schools", label: "Stories" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0D0A1A] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="text-white font-extrabold text-lg tracking-tight">
              GrowVia
            </Link>
            <p className="text-sm text-white/30 mt-3 leading-relaxed">
              GrowVia turns decades of experience into the next generation&apos;s success.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/40 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/20">&copy; 2026 GrowVia. All rights reserved.</p>
          <Link
            href="/admin"
            className="text-xs text-white/10 hover:text-white/25 transition-colors duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
