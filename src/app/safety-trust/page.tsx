import Link from "next/link";
import {
  Shield,
  CheckCircle,
  Lock,
  Eye,
  UserCheck,
  AlertTriangle,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function SafetyTrustPage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            Safety & Trust
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Your safety is our{" "}
            <span className="gradient-text">top priority</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            GrowVia is built on trust. Every feature, every process, and every decision is designed to keep our community safe and supported.
          </p>
        </div>
      </section>

      {/* Mentor Verification */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-purple-600 font-semibold text-sm mb-3">Mentor Verification</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Every mentor is manually verified</h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                We do not allow anyone to become a mentor on GrowVia without going through our verification process. Every mentor application is reviewed by our team before the mentor becomes visible on the platform.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Application review by our team", desc: "We read every application manually. No automated approvals." },
                  { label: "Professional background check", desc: "We verify professional history and experience claims." },
                  { label: "Status: under review", desc: "Mentors are marked as 'under review' until approved. Only approved mentors appear publicly." },
                  { label: "Ongoing quality monitoring", desc: "We monitor session quality and user feedback continuously." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
              <div className="space-y-4">
                {[
                  { label: "Application Submitted", status: "done" },
                  { label: "Professional Background Verified", status: "done" },
                  { label: "Team Review", status: "done" },
                  { label: "Approved & Live on Platform", status: "done" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white card-shadow flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 bg-white rounded-xl px-4 py-3 card-shadow">
                      <span className="text-sm font-medium text-gray-800">{step.label}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Verified Mentor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Security */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure sessions</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every session is structured, recorded in our system, and supported by our team.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Private & Confidential",
                desc: "Session details are private between the mentor and mentee. We respect the confidentiality of every conversation.",
              },
              {
                icon: Eye,
                title: "Transparent History",
                desc: "Both parties have access to their session history. Session status (upcoming, completed, cancelled) is always visible.",
              },
              {
                icon: UserCheck,
                title: "Identity Protection",
                desc: "We protect personal information in accordance with GDPR. Your data is never sold or shared with third parties.",
              },
              {
                icon: Shield,
                title: "Reporting System",
                desc: "Any user can report inappropriate behavior at any time. Reports are reviewed within 24 hours by our team.",
              },
              {
                icon: AlertTriangle,
                title: "Zero Tolerance Policy",
                desc: "We have zero tolerance for harassment, discrimination, or inappropriate conduct. Violations result in immediate account suspension.",
              },
              {
                icon: Phone,
                title: "Support Available",
                desc: "Our support team is available if you ever feel uncomfortable or need assistance before, during, or after a session.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data protection</h2>
            <p className="text-gray-500 text-lg">
              GrowVia is fully compliant with GDPR and takes your privacy seriously.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              "Your personal data is stored securely on encrypted servers",
              "We only collect data that is necessary to operate the platform",
              "You can request deletion of your data at any time",
              "We never sell or share your data with third parties",
              "All payment processing is handled by Stripe with no card data stored on our side",
              "Cookies are used only for essential platform functionality",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/legal/privacy" className="text-purple-600 font-medium hover:text-purple-800 transition-colors text-sm">
              Read our full Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 gradient-bg text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Have a safety concern?</h2>
          <p className="text-purple-100 mb-8">
            Our team takes every report seriously. Do not hesitate to reach out if something does not feel right.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors"
          >
            Contact Our Team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
