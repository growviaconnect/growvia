import Link from "next/link";

export default function TermsPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: April 9, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. About GrowVia</h2>
            <p className="leading-relaxed">
              GrowVia is an educational mentorship platform that connects individuals (mentees) with experienced professionals (mentors) for the purpose of career guidance, personal development, and professional growth. GrowVia is operated by GrowVia SAS, headquartered in Paris, France.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Nature of the Platform</h2>
            <p className="leading-relaxed mb-3">
              GrowVia is an educational platform. The sessions and interactions facilitated through GrowVia are informational mentoring sessions intended for guidance and personal development purposes.
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Mentors on GrowVia are independent individuals, not employees or contractors of GrowVia",
                "GrowVia does not employ mentors and is not responsible for their advice or conduct",
                "Sessions are informational mentoring and do not constitute professional advice (legal, medical, financial, etc.)",
                "GrowVia makes no guarantees regarding specific career outcomes or results",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Payments & Platform Access</h2>
            <p className="leading-relaxed mb-3">
              Payments made through GrowVia are for access to the GrowVia platform and its features, not for the mentors' time directly. GrowVia facilitates connections between mentors and mentees and manages the booking and scheduling infrastructure.
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Freemium plan: first session is free, no credit card required",
                "Pay-per-session: 29€ per session, charged at booking",
                "Subscription: 39€/month, billed monthly, cancelable at any time",
                "All prices include applicable VAT",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cancellation Policy</h2>
            <p className="leading-relaxed">
              Sessions may be cancelled at least 1 hour before the scheduled start time. Cancellations made less than 1 hour before the session are considered late cancellations and will be noted on the user's account. No refund is issued for cancelled sessions, regardless of the reason for cancellation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. User Conduct</h2>
            <p className="leading-relaxed mb-3">
              Users of GrowVia agree to conduct themselves respectfully and professionally at all times. The following is strictly prohibited:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "Harassment, discrimination, or abusive behavior toward any user",
                "Sharing false or misleading information in your profile",
                "Using the platform for any illegal purpose",
                "Circumventing the platform to arrange sessions outside of GrowVia",
                "Sharing session details or confidential information without consent",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              GrowVia is not liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform or from sessions conducted through GrowVia. GrowVia does not guarantee any specific outcome from mentoring sessions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to These Terms</h2>
            <p className="leading-relaxed">
              GrowVia reserves the right to update these Terms of Service at any time. Users will be notified of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
            <p className="leading-relaxed">
              For questions regarding these terms, please contact us at{" "}
              <a href="mailto:legal@growvia.com" className="text-purple-600 hover:text-purple-800">
                legal@growvia.com
              </a>
              .
            </p>
          </div>
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
