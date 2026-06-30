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
        <p className="text-sm text-white/40 mb-12">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <p className="text-white/50 italic">
            This page is a placeholder. The final Privacy Policy content will be added shortly.
          </p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Data we collect</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How we use your data</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Sharing &amp; third parties</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your rights (GDPR)</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
            <p>
              For privacy concerns or data-access requests, email{" "}
              <a href="mailto:contact@growviaconnect.com" className="text-[#A78BFA] hover:text-white transition-colors">
                contact@growviaconnect.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
