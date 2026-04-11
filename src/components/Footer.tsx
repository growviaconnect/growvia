import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl text-white">
                Grow<span className="gradient-text">Via</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-purple-400 mb-2">Where careers are built.</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              GrowVia matches ambitious students and young professionals with experienced mentors through AI — in minutes, not months.
            </p>
            <div className="flex gap-3">
              {["Instagram", "LinkedIn", "X"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-purple-700 hover:text-white transition-colors text-xs font-bold"
                  title={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/how-it-works" className="hover:text-purple-400 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link href="/for-schools" className="hover:text-purple-400 transition-colors">For Schools</Link></li>
              <li><Link href="/safety-trust" className="hover:text-purple-400 transition-colors">Safety & Trust</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/who-we-are" className="hover:text-purple-400 transition-colors">Who We Are</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/legal/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/mentor-agreement" className="hover:text-purple-400 transition-colors">Mentor Agreement</Link></li>
              <li><Link href="/legal/user-agreement" className="hover:text-purple-400 transition-colors">User Agreement</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} GrowVia. All rights reserved.</p>
          <p>Made with care by Luna Davin & Yasmine Tunon</p>
        </div>
      </div>
    </footer>
  );
}
