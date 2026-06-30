export const metadata = {
  title: "Privacy Policy — GrowVia Connect",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D0A1A] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-[0.22em] uppercase text-[#A78BFA] mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-white/40 mb-16">
          Last updated: July 2026
        </p>

        <div className="space-y-12 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">1. Who We Are</h2>
            <p>
              GrowVia Connect is a mentorship platform operated from Barcelona, Spain. We are
              committed to protecting your personal data in accordance with the General Data
              Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Account data:</strong> name, email address, password (encrypted)</li>
              <li><strong className="text-white">Profile data:</strong> professional background, field of expertise, hobbies, profile photo, bio</li>
              <li><strong className="text-white">Session data:</strong> booking history, session dates, duration, communication with mentors/mentees</li>
              <li><strong className="text-white">Payment data:</strong> subscription plan, payment history (processed securely via Stripe — we do not store card details)</li>
              <li><strong className="text-white">Usage data:</strong> pages visited, features used, device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account</li>
              <li>To match mentees with compatible mentors (AI matching)</li>
              <li>To process bookings and payments</li>
              <li>To send transactional emails (booking confirmations, reminders, cancellations)</li>
              <li>To improve the platform and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">4. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Stripe</strong> for payment processing</li>
              <li><strong className="text-white">Supabase</strong> for secure data storage</li>
              <li><strong className="text-white">Resend</strong> for transactional email delivery</li>
              <li><strong className="text-white">Whereby</strong> for video session infrastructure</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active. If you delete
              your account, your data will be permanently deleted within 30 days, except where
              retention is required by law (e.g. financial records).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">6. Your Rights (GDPR)</h2>
            <p className="mb-3">As a user based in the EU, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at:{" "}
              <a href="mailto:contact@growviaconnect.com" className="text-[#A78BFA] hover:text-white transition-colors">
                contact@growviaconnect.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">7. Cookies</h2>
            <p>
              GrowVia Connect uses essential cookies to maintain your session and preferences.
              We do not use advertising or tracking cookies. You can manage cookie preferences
              in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">8. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data storage,
              HTTPS, and secure authentication via Supabase Auth.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">9. Children</h2>
            <p>
              GrowVia Connect is not intended for users under 18. We do not knowingly collect
              data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#A78BFA]">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you by email
              of any significant changes.
            </p>
          </section>

          <section className="pt-8 border-t border-white/[0.08] space-y-2">
            <p className="text-sm">
              <span className="text-white/45">Contact: </span>
              <a href="mailto:contact@growviaconnect.com" className="text-[#A78BFA] hover:text-white transition-colors">
                contact@growviaconnect.com
              </a>
            </p>
            <p className="text-sm text-white/45">
              Data Controller: GrowVia Connect, Barcelona, Spain
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
