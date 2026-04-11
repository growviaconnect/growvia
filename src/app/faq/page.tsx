"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I get started on GrowVia?",
        a: "Sign up, complete your profile, and book a Discovery Session for 9.99€. This 15–20 minute intro session lets you meet a mentor and try our AI Smart Matching feature once. No long-term commitment required.",
      },
      {
        q: "Do I need an account to browse mentors?",
        a: "You need to create a profile to access our full mentor directory and use AI matching. Creating a profile is free and takes about 5 minutes.",
      },
      {
        q: "How do I become a mentee?",
        a: "Simply register on GrowVia, complete your profile with your goals and background, and you can immediately start browsing mentors and book your free first session.",
      },
    ],
  },
  {
    category: "Sessions & Booking",
    questions: [
      {
        q: "How do sessions work?",
        a: "Sessions take place via Google Meet, which is integrated directly into the GrowVia platform. Once you book a session, a unique meeting link is automatically generated and shared with both you and your mentor via email. You just click the link to join.",
      },
      {
        q: "How long are the sessions?",
        a: "Sessions are available in 30 or 60 minute formats, depending on the mentor's offerings and your preference.",
      },
      {
        q: "Can I see my upcoming and past sessions?",
        a: "Yes. Your personal calendar and session history are available in your dashboard. You can see upcoming sessions, past sessions, and their status (upcoming, completed, or cancelled).",
      },
    ],
  },
  {
    category: "Pricing & Payments",
    questions: [
      {
        q: "How does payment work?",
        a: "After choosing a mentor and selecting a time, you are guided through a secure checkout powered by Stripe. The Discovery Session costs 9.99€ (one-time). Monthly plans (Basic 19.99€ or Premium 39.99€) renew monthly and can be cancelled anytime.",
      },
      {
        q: "Is payment secure?",
        a: "Absolutely. All payments are processed through Stripe, which uses bank-grade TLS encryption. GrowVia never stores your card information on our servers. Your financial data is always protected.",
      },
      {
        q: "What is included in the subscription plans?",
        a: "Basic (19.99€/month) includes 2 sessions per month and 1 AI Smart Matching use. Premium (39.99€/month) includes 4 sessions per month, unlimited AI Smart Matching, priority booking, and personalized recommendations. Both plans can be cancelled anytime.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No. The price you see is the price you pay. All prices include applicable VAT. There are no setup fees, cancellation fees, or hidden charges.",
      },
    ],
  },
  {
    category: "Cancellation Policy",
    questions: [
      {
        q: "Can I cancel a booked session?",
        a: "Yes. You can cancel a session at any time, but you must do so at least 1 hour before the scheduled start time. Late cancellations (within 1 hour of the session) are noted on your account.",
      },
      {
        q: "Will I get a refund if I cancel?",
        a: "No. Our cancellation policy does not include refunds, regardless of the reason for cancellation. If you cancel more than 1 hour in advance, your session credit may be returned depending on your plan.",
      },
    ],
  },
  {
    category: "Mentors",
    questions: [
      {
        q: "How are mentors selected?",
        a: "Every mentor on GrowVia goes through a manual approval process. They submit an application, and our team reviews their background, experience, and motivations before approving them. Only verified mentors appear on the platform.",
      },
      {
        q: "Can I save mentors I like?",
        a: "Yes. You can add mentors to your favorites by clicking the heart icon on their profile. Your saved mentors are accessible from your dashboard under Saved Mentors, and you can book directly from there.",
      },
      {
        q: "What if I am not satisfied with my mentor match?",
        a: "If the AI match does not feel right, you can browse our full mentor directory and choose a different mentor. Subscription users get unlimited AI matching attempts.",
      },
    ],
  },
  {
    category: "For Schools",
    questions: [
      {
        q: "How can my school use GrowVia?",
        a: "Schools can create an institutional account and invite students via a dedicated link. Students who sign up using their school email are automatically linked to the school account. The school admin can then track sessions, participation, and overall activity.",
      },
      {
        q: "How do students get access through their school?",
        a: "Your school will send an invitation link to students. Students sign up using their school email address and are automatically connected to your institution's dashboard.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-500 leading-relaxed text-sm border-t border-gray-50 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            FAQ
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Frequently asked <span className="gradient-text">questions</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Everything you need to know about GrowVia. Cannot find your answer? Contact us directly.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  {section.category}
                </h2>
                <div className="space-y-3">
                  {section.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-purple-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 mb-6">
              Our team is happy to help. Reach out and we will get back to you quickly.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Contact Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
