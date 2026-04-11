import Link from "next/link";

export default function UserAgreementPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">User Agreement</h1>
          <p className="text-gray-400 text-sm">Last updated: April 2026 · Applies to all users of GrowVia.</p>
          <p className="text-gray-400 text-sm mt-1">Available in: English · Español · Français</p>
        </div>

        <div className="space-y-8 text-gray-600">
          {[
            {
              title: "1. Acceptance of Terms",
              content: "By creating an account and using GrowVia, you agree to this User Agreement, our Terms of Service, and our Privacy Policy. If you do not agree with these terms, you may not use the platform.",
            },
            {
              title: "2. Account Creation",
              content: "You must provide accurate and complete information when creating your GrowVia account. You are responsible for maintaining the security of your account credentials. You must notify GrowVia immediately of any unauthorized access to your account.",
            },
            {
              title: "3. User Roles",
              content: "GrowVia supports three user roles: mentee, mentor, and school admin. Each role has specific permissions and responsibilities as outlined in the relevant sections of our Terms of Service and this agreement. School accounts have additional capabilities for managing student users.",
            },
            {
              title: "4. Acceptable Use",
              items: [
                "Use GrowVia only for its intended purpose of career guidance and mentoring",
                "Treat all other users with respect and professionalism",
                "Provide accurate information in your profile and during sessions",
                "Not share your account with any other person",
                "Not use GrowVia to promote, sell, or advertise products or services",
                "Not attempt to circumvent the platform to conduct sessions outside of GrowVia",
              ],
            },
            {
              title: "5. Sessions & Bookings",
              content: "When you book a session on GrowVia, you agree to attend at the scheduled time. If you need to cancel, you must do so at least 1 hour before the session. Late cancellations are noted on your profile. No refunds are issued for cancelled sessions.",
            },
            {
              title: "6. Payments",
              content: "GrowVia operates as a marketplace and collects payments from mentees on behalf of independent mentors. Paid sessions and subscriptions are processed through Stripe. By completing a payment, you authorize GrowVia to charge your payment method for the applicable amount. The contractual relationship for the delivery of mentoring services exists between you and the independent mentor. All sales are final and no refunds are offered unless required by applicable law.",
            },
            {
              title: "7. Content & Confidentiality",
              content: "You are responsible for any content you share on GrowVia. Session content is private and should not be shared without the explicit consent of both parties. GrowVia reserves the right to remove content that violates our community guidelines.",
            },
            {
              title: "8. Account Suspension",
              content: "GrowVia may suspend or terminate your account at any time for violation of this agreement, the Terms of Service, or for conduct deemed harmful to other users or the platform community.",
            },
            {
              title: "9. Contact",
              content: "For questions about this agreement, please contact us at support@growvia.com.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              {section.content && <p className="leading-relaxed">{section.content}</p>}
              {section.items && (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-purple-600">
          <Link href="/legal/terms" className="hover:text-purple-800 transition-colors">Terms of Service</Link>
          <Link href="/legal/privacy" className="hover:text-purple-800 transition-colors">Privacy Policy</Link>
          <Link href="/legal/mentor-agreement" className="hover:text-purple-800 transition-colors">Mentor Agreement</Link>
        </div>
      </div>
    </section>
  );
}
