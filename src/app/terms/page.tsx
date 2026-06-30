export const metadata = {
  title: "Terms and Conditions — GrowVia Connect",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0A1A] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#A78BFA] mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Terms and Conditions
        </h1>
        <p className="text-sm text-white/40 mb-16">
          Last updated: July 2026
        </p>

        <div className="space-y-12 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">1. About GrowVia Connect</h2>
            <p>
              GrowVia Connect is a mentorship marketplace connecting mentees (students and young professionals)
              with verified mentors. The platform is operated by GrowVia Connect, headquartered in Barcelona, Spain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">2. Acceptance of Terms</h2>
            <p>
              By creating an account or using the platform in any way, you agree to these Terms and Conditions.
              If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information when registering.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 18 years old to register as a mentor or mentee.</li>
              <li>GrowVia Connect reserves the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">4. Mentor Eligibility and Conduct</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Mentors must complete the application process and be approved by GrowVia Connect before offering sessions.</li>
              <li>Mentors agree to conduct sessions professionally, on time, and in accordance with the platform&apos;s standards.</li>
              <li>Mentors may not solicit mentees for services outside the platform.</li>
              <li>GrowVia Connect takes a commission on each paid session. The current commission rate is communicated during the application process and may be updated with prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">5. Sessions and Bookings</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sessions are booked through the platform and conducted via Whereby video link.</li>
              <li>Discovery Sessions are introductory sessions offered at no cost to the mentee.</li>
              <li>Paid sessions are charged according to the mentee&apos;s active subscription plan.</li>
              <li>A confirmed session constitutes a binding commitment for both mentor and mentee.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">6. Cancellation and Refund Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sessions may be cancelled up to <strong className="text-white">2 hours</strong> before the scheduled start time for a full refund.</li>
              <li>Cancellations made less than 2 hours before the session start time will not be refunded.</li>
              <li>In cases of technical failure attributable to the platform, GrowVia Connect will assess refunds on a case-by-case basis.</li>
              <li>Subscription fees are non-refundable once the billing period has started.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">7. Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>GrowVia Connect processes all payments on behalf of mentors via Stripe.</li>
              <li>Mentors are paid their session earnings net of GrowVia&apos;s commission.</li>
              <li>Subscriptions are billed monthly and renew automatically unless cancelled before the renewal date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">8. Prohibited Conduct</h2>
            <p className="mb-3">Users may not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Harass, discriminate against, or disrespect other users.</li>
              <li>Share false or misleading information in their profile.</li>
              <li>Attempt to bypass the platform to arrange direct payments with mentors or mentees.</li>
              <li>Use the platform for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">9. Intellectual Property</h2>
            <p>
              All content on GrowVia Connect (logo, design, copy, platform features) is the property of
              GrowVia Connect and may not be reproduced without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">10. Limitation of Liability</h2>
            <p>
              GrowVia Connect acts as an intermediary between mentors and mentees. We do not guarantee
              specific outcomes from mentorship sessions. Our liability is limited to the amount paid
              for the session in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">11. Modifications</h2>
            <p>
              GrowVia Connect reserves the right to update these Terms at any time. Users will be
              notified of significant changes by email. Continued use of the platform constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Spain. Any disputes shall be subject to the
              jurisdiction of the courts of Barcelona.
            </p>
          </section>

          <section className="pt-8 border-t border-white/[0.08]">
            <p className="text-sm">
              <span className="text-white/45">Contact: </span>
              <a href="mailto:contact@growviaconnect.com" className="text-[#A78BFA] hover:text-white transition-colors">
                contact@growviaconnect.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
