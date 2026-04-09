import Link from "next/link";

export default function MentorAgreementPage() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
            Legal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Mentor Agreement</h1>
          <p className="text-gray-400 text-sm">Last updated: April 9, 2026</p>
        </div>

        <div className="space-y-8 text-gray-600">
          {[
            {
              title: "1. Independent Contractor Status",
              content: "By becoming a mentor on GrowVia, you acknowledge that you are acting as an independent contractor and not as an employee, agent, or partner of GrowVia. You are solely responsible for your conduct during sessions and for the guidance you provide.",
            },
            {
              title: "2. Application & Approval Process",
              content: "Becoming a mentor on GrowVia requires submitting an application and completing our verification process. Your application will be reviewed manually by our team. You will be notified of the outcome. GrowVia reserves the right to approve or decline any application at its discretion.",
            },
            {
              title: "3. Mentor Responsibilities",
              items: [
                "Provide honest, accurate, and up-to-date information in your profile",
                "Conduct sessions professionally and respectfully",
                "Be punctual and prepared for all scheduled sessions",
                "Notify mentees and GrowVia of any cancellations with reasonable notice",
                "Maintain confidentiality of mentee information shared during sessions",
                "Not solicit mentees to engage in services outside the GrowVia platform",
              ],
            },
            {
              title: "4. Code of Conduct",
              content: "Mentors must maintain the highest standards of professionalism and respect. Harassment, discrimination, or inappropriate conduct of any kind will result in immediate suspension and removal from the platform.",
            },
            {
              title: "5. Session Guidelines",
              content: "Sessions are conducted via Google Meet, integrated directly into the GrowVia platform. Mentors must use the platform-generated meeting link for all sessions. Recording sessions is only permitted with explicit consent from both parties.",
            },
            {
              title: "6. Disclaimer of Advice",
              content: "Sessions on GrowVia are informational mentoring only and do not constitute professional legal, financial, medical, or other regulated advice. Mentors must not present themselves as providing such professional services.",
            },
            {
              title: "7. Termination",
              content: "GrowVia reserves the right to suspend or terminate a mentor's account at any time for violations of this agreement, the Terms of Service, or for conduct deemed harmful to the community.",
            },
            {
              title: "8. Contact",
              content: "Questions about this agreement? Contact us at mentors@growvia.com.",
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
          <Link href="/legal/user-agreement" className="hover:text-purple-800 transition-colors">User Agreement</Link>
        </div>
      </div>
    </section>
  );
}
