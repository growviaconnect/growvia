import Link from "next/link";

const sections = [
  {
    num: "1",
    title: "Introduction",
    content: `GrowVia ("GrowVia", "we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use the GrowVia platform.

GrowVia is operated by GrowVia, headquartered in Barcelona, Spain. We serve users primarily in Spain, France, and other countries where our services are available. This policy is available in English, Español, and Français.

GrowVia is fully compliant with the General Data Protection Regulation (GDPR) and applicable Spanish data protection law.`,
  },
  {
    num: "2",
    title: "Data We Collect",
    content: "We collect the following categories of personal data:",
    bullets: [
      { label: "Account data", desc: "Name, email address, password (encrypted), and account type (mentee, mentor, school admin)" },
      { label: "Profile data", desc: "Professional background, career goals, areas of interest, and availability preferences" },
      { label: "Session data", desc: "Booked sessions, session history, and session status" },
      { label: "Payment data", desc: "Billing information processed through Stripe. GrowVia does not store card details." },
      { label: "Usage data", desc: "How you interact with the platform, pages visited, and features used" },
      { label: "Communication data", desc: "Messages sent through our contact forms" },
    ],
    labeledBullets: true,
  },
  {
    num: "3",
    title: "How We Use Your Data",
    bullets: [
      "To create and manage your account",
      "To facilitate AI-powered mentor matching and session bookings",
      "To send session confirmations and reminders via email",
      "To process payments securely through Stripe on behalf of mentors",
      "To improve the platform and user experience",
      "To comply with legal obligations under Spanish and EU law",
    ],
  },
  {
    num: "4",
    title: "Data Storage & Security",
    content: `Your data is stored on secure, encrypted servers. We use industry-standard security measures to protect your information from unauthorized access, disclosure, or loss. Access to personal data is restricted to authorized GrowVia team members only.

As GrowVia operates as a marketplace, certain profile information (such as mentor name, photo, and professional background) is shared with mentees to facilitate bookings. Session details necessary for payment processing are shared with Stripe.`,
  },
  {
    num: "5",
    title: "Data Sharing",
    content: "We do not sell your personal data to third parties. We may share data with:",
    bullets: [
      "Stripe — for secure payment processing between mentees and the GrowVia platform",
      "Google — for Google Meet session link generation and integration",
      "Independent mentors — limited profile and booking data necessary to confirm and deliver sessions",
      "Service providers who help us operate the platform, under strict data processing agreements",
      "Law enforcement or regulatory authorities if required by applicable law",
    ],
  },
  {
    num: "6",
    title: "Your GDPR Rights",
    content: "Under GDPR and applicable EU data protection law, you have the following rights:",
    bullets: [
      "Right to access your personal data",
      "Right to correct inaccurate data",
      "Right to erasure (the right to be forgotten)",
      "Right to restrict processing",
      "Right to data portability",
      "Right to object to processing",
    ],
    gdprContact: true,
  },
  {
    num: "7",
    title: "Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide you with our services. If you close your account, we will delete or anonymize your data within 30 days, except where retention is required by law.

Session records and payment data may be retained for up to 5 years to comply with Spanish fiscal and accounting obligations.`,
  },
  {
    num: "8",
    title: "Cookies",
    content: `We use cookies only for essential platform functionality, such as maintaining your login session and user preferences. We do not use advertising or tracking cookies.

You may disable non-essential cookies through your browser settings. Disabling essential cookies may affect platform functionality.`,
  },
  {
    num: "9",
    title: "Governing Law",
    content: `This Privacy Policy is governed by the laws of Spain and applicable EU regulations, including the GDPR. Any disputes arising from this policy shall be subject to the jurisdiction of the courts of Barcelona, Spain, unless otherwise required by mandatory consumer protection law in your country of residence.

Users located in other EU member states retain the right to lodge a complaint with their national data protection authority.`,
  },
  {
    num: "10",
    title: "Contact",
    content: `For any privacy-related inquiries or to exercise your GDPR rights, contact our Data Protection team at privacy@growvia.com or by post at: GrowVia, Barcelona, Spain.`,
    email: "privacy@growvia.com",
  },
];

export default function PrivacyPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: April 2026 · Applies to all users of GrowVia.</p>
          <p className="text-gray-400 text-sm mt-1">Available in: English · Español · Français</p>
        </div>

        <div className="space-y-8 text-gray-600">
          {sections.map((s) => (
            <div key={s.num}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {s.num}. {s.title}
              </h2>
              {s.content && (
                <p className="leading-relaxed whitespace-pre-line mb-3">{s.content}</p>
              )}
              {s.bullets && !s.labeledBullets && (
                <ul className="space-y-2">
                  {(s.bullets as string[]).map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.bullets && s.labeledBullets && (
                <ul className="space-y-2.5">
                  {(s.bullets as { label: string; desc: string }[]).map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-gray-800">{b.label}:</strong> {b.desc}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.gdprContact && (
                <p className="text-sm mt-3 leading-relaxed">
                  To exercise any of these rights, contact us at{" "}
                  <a href="mailto:privacy@growvia.com" className="text-purple-600 hover:text-purple-800">
                    privacy@growvia.com
                  </a>
                  .
                </p>
              )}
              {s.email && (
                <p className="mt-2 text-sm">
                  Contact:{" "}
                  <a href={`mailto:${s.email}`} className="text-purple-600 hover:text-purple-800">
                    {s.email}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 flex flex-wrap gap-4 text-sm text-purple-600">
          <Link href="/legal/terms" className="hover:text-purple-800 transition-colors">Terms of Service</Link>
          <Link href="/legal/mentor-agreement" className="hover:text-purple-800 transition-colors">Mentor Agreement</Link>
          <Link href="/legal/user-agreement" className="hover:text-purple-800 transition-colors">User Agreement</Link>
        </div>
      </div>
    </section>
  );
}
