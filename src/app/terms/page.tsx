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
        <p className="text-sm text-white/40 mb-12">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <p className="text-white/50 italic">
            This page is a placeholder. The final Terms and Conditions content will be added shortly.
          </p>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of the platform</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Mentor &amp; mentee responsibilities</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Payments &amp; refunds</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Liability</h2>
            <p>To be completed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
            <p>
              Questions? Email{" "}
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
