import Link from "next/link";

const sections = [
  {
    num: "1",
    title: "About GrowVia",
    content: `GrowVia is an online marketplace platform that connects individuals ("mentees") with experienced independent professionals ("mentors") for career guidance, personal development, and professional growth.

GrowVia is operated by GrowVia, headquartered in Barcelona, Spain. Our primary markets are Spain, France, and any other country where our services are lawfully available. The platform is available in Spanish, French, and English.

These Terms of Service govern your use of the GrowVia platform, including the website, booking system, and all related services.`,
  },
  {
    num: "2",
    title: "Nature of the Platform — Marketplace Model",
    content: `GrowVia operates as a two-sided marketplace, similar to platforms such as Airbnb or Malt. GrowVia does not itself provide mentoring services. Instead, GrowVia provides the technology infrastructure that allows mentees to discover, book, and pay independent mentor professionals.

The following clarifications apply:`,
    bullets: [
      "Mentors are independent service providers, not employees, agents, or contractors of GrowVia",
      "GrowVia does not control the content of mentoring sessions and is not responsible for the advice given by mentors",
      "Sessions are informational mentoring only — they do not constitute professional legal, medical, financial, or psychological advice",
      "GrowVia makes no guarantees regarding specific career outcomes or results from mentoring",
      "The contractual relationship for the delivery of mentoring services exists directly between the mentee and the mentor",
    ],
  },
  {
    num: "3",
    title: "Payments & Commission",
    content: `All payments on GrowVia pass through GrowVia as the marketplace operator. GrowVia collects payment from mentees on behalf of mentors and remits the mentor's share after deducting a platform commission.`,
    bullets: [
      "Discovery Session: 9.99€ (one-time, 15–20 minutes)",
      "Basic plan: 19.99€/month — 2 sessions per month",
      "Premium plan: 39.99€/month — 4 sessions per month + unlimited AI matching",
      "GrowVia charges mentors a commission of 5–10% per completed session. This covers lead generation, payment processing, scheduling infrastructure, and dashboard access",
      "Mentor payouts are processed through Stripe after each completed session, minus the applicable commission",
      "All prices displayed to mentees include applicable VAT where required by Spanish or EU law",
    ],
  },
  {
    num: "4",
    title: "Account Registration",
    content: `To use GrowVia, you must create an account. By registering, you confirm that:`,
    bullets: [
      "You are at least 16 years old (or have parental consent if required in your jurisdiction)",
      "The information you provide is accurate and complete",
      "You will keep your account credentials confidential",
      "You are responsible for all activity that occurs under your account",
    ],
  },
  {
    num: "5",
    title: "Cancellation Policy",
    content: `Sessions may be cancelled at least 1 hour before the scheduled start time without penalty. Cancellations made less than 1 hour before the session are considered late cancellations and will be noted on the user's account.

No refund is issued for cancelled sessions, regardless of the reason for cancellation. If a mentor cancels a session, the mentee will receive a full session credit for rescheduling.`,
  },
  {
    num: "6",
    title: "User Conduct",
    content: `All users of GrowVia agree to conduct themselves respectfully and professionally at all times. The following is strictly prohibited:`,
    bullets: [
      "Harassment, discrimination, or abusive behavior toward any user",
      "Providing false or misleading information in your profile",
      "Using the platform for any illegal purpose",
      "Circumventing the platform to arrange sessions outside of GrowVia in order to avoid platform fees",
      "Recording sessions without explicit consent from all participants",
      "Sharing session content or confidential information without consent",
    ],
  },
  {
    num: "7",
    title: "Intellectual Property",
    content: `All content on the GrowVia platform — including the brand, design, software, and written materials — is the property of GrowVia and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written permission from GrowVia.`,
  },
  {
    num: "8",
    title: "Limitation of Liability",
    content: `To the extent permitted by applicable law, GrowVia is not liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform, the quality of mentoring sessions, or any decisions made based on mentoring advice.

GrowVia's total liability to any user for any claim arising from use of the platform shall not exceed the amount paid by that user to GrowVia in the three months preceding the claim.`,
  },
  {
    num: "9",
    title: "Governing Law & Jurisdiction",
    content: `These Terms of Service are governed by the laws of Spain. Any dispute arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Barcelona, Spain, unless otherwise required by mandatory consumer protection law in the user's country of residence.

Users located in other EU member states retain the right to bring claims before the courts of their country of habitual residence, in accordance with EU consumer protection regulations.`,
  },
  {
    num: "10",
    title: "Changes to These Terms",
    content: `GrowVia reserves the right to update these Terms of Service at any time. Users will be notified of material changes via email at least 14 days before they take effect. Continued use of the platform after changes constitutes acceptance of the updated terms.`,
  },
  {
    num: "11",
    title: "Contact",
    content: `For questions regarding these Terms, please contact us at legal@growvia.com or by post at: GrowVia, Barcelona, Spain.`,
    email: "legal@growvia.com",
  },
];

export default function TermsPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
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
              {s.bullets && (
                <ul className="space-y-2">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
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

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-purple-600">
          <Link href="/legal/privacy" className="hover:text-purple-800 transition-colors">Privacy Policy</Link>
          <Link href="/legal/mentor-agreement" className="hover:text-purple-800 transition-colors">Mentor Agreement</Link>
          <Link href="/legal/user-agreement" className="hover:text-purple-800 transition-colors">User Agreement</Link>
        </div>
      </div>
    </section>
  );
}
