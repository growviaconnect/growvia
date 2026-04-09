import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: April 9, 2026</p>
        </div>

        <div className="space-y-8 text-gray-600">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              GrowVia SAS ("GrowVia", "we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use the GrowVia platform. GrowVia is fully compliant with the General Data Protection Regulation (GDPR).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data We Collect</h2>
            <p className="leading-relaxed mb-3">We collect the following categories of personal data:</p>
            <ul className="space-y-2.5">
              {[
                { label: "Account data", desc: "Name, email address, password (encrypted), and account type (mentee, mentor, school admin)" },
                { label: "Profile data", desc: "Professional background, career goals, areas of interest, and availability preferences" },
                { label: "Session data", desc: "Booked sessions, session history, and session status" },
                { label: "Payment data", desc: "Billing information processed through Stripe. GrowVia does not store card details." },
                { label: "Usage data", desc: "How you interact with the platform, pages visited, and features used" },
                { label: "Communication data", desc: "Messages sent through our contact forms" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-sm">
                  <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                  <span><strong className="text-gray-800">{item.label}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-2 list-none">
              {[
                "To create and manage your account",
                "To facilitate mentor matching and session bookings",
                "To send session confirmations and reminders",
                "To process payments securely through Stripe",
                "To improve the platform and user experience",
                "To comply with legal obligations",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Storage & Security</h2>
            <p className="leading-relaxed">
              Your data is stored on secure, encrypted servers. We use industry-standard security measures to protect your information from unauthorized access, disclosure, or loss. Access to personal data is restricted to authorized GrowVia team members only.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Sharing</h2>
            <p className="leading-relaxed mb-3">
              We do not sell your personal data to third parties. We may share data with:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Stripe for payment processing",
                "Google for Google Meet session integration",
                "Service providers who help us operate the platform, under strict data processing agreements",
                "Law enforcement or regulatory authorities if required by law",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your GDPR Rights</h2>
            <p className="leading-relaxed mb-3">Under GDPR, you have the following rights:</p>
            <ul className="space-y-2 list-none">
              {[
                "Right to access your personal data",
                "Right to correct inaccurate data",
                "Right to erasure (the right to be forgotten)",
                "Right to restrict processing",
                "Right to data portability",
                "Right to object to processing",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3 leading-relaxed">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@growvia.com" className="text-purple-600 hover:text-purple-800">
                privacy@growvia.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p className="leading-relaxed">
              We use cookies only for essential platform functionality, such as maintaining your login session and user preferences. We do not use advertising or tracking cookies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
            <p className="leading-relaxed">
              For any privacy-related inquiries, contact our Data Protection team at{" "}
              <a href="mailto:privacy@growvia.com" className="text-purple-600 hover:text-purple-800">
                privacy@growvia.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-purple-600">
          <Link href="/legal/terms" className="hover:text-purple-800 transition-colors">Terms of Service</Link>
          <Link href="/legal/mentor-agreement" className="hover:text-purple-800 transition-colors">Mentor Agreement</Link>
          <Link href="/legal/user-agreement" className="hover:text-purple-800 transition-colors">User Agreement</Link>
        </div>
      </div>
    </section>
  );
}
