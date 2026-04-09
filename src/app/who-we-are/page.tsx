import Link from "next/link";
import { ArrowRight, Heart, Target, Globe, Lightbulb } from "lucide-react";

const founders = [
  {
    name: "Luna Davin",
    role: "Co-Founder & CEO",
    initials: "LD",
    bio: "Luna experienced firsthand the confusion of choosing a career path after graduating. Unable to find mentors who truly understood her journey, she decided to build the platform she wished had existed. Her vision is to make quality mentoring accessible to every ambitious young person, regardless of their background.",
    color: "from-purple-500 to-violet-600",
  },
  {
    name: "Yasmine Tunon",
    role: "Co-Founder & COO",
    initials: "YT",
    bio: "Yasmine brings a deep passion for human-centered design and community building. Having worked across multiple countries and industries, she understands the complexities of navigating a global job market. She leads operations, mentor quality, and the school partnerships program at GrowVia.",
    color: "from-violet-500 to-purple-700",
  },
];

const values = [
  {
    icon: Heart,
    title: "Human First",
    desc: "Every interaction on GrowVia is built around real human connection. We believe that the most powerful guidance comes from people who truly care.",
  },
  {
    icon: Target,
    title: "Clarity Over Noise",
    desc: "We cut through the confusion. Every session ends with concrete next steps, not just inspiration.",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    desc: "Career guidance should not be a privilege. We work to make quality mentoring available to students and professionals everywhere.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Growth",
    desc: "We believe in lifelong learning for everyone on the platform, mentors and mentees alike.",
  },
];

export default function WhoWeArePage() {
  return (
    <>
      {/* Header */}
      <section className="gradient-bg-soft pt-20 pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6 card-shadow">
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Built by people who were{" "}
            <span className="gradient-text">once lost too</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            GrowVia was born from a simple frustration: talented, ambitious people were making career decisions in the dark.
            We decided to change that.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-purple-600 font-semibold text-sm mb-3">Our Mission</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
                Connect generations and unlock potential
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                Too many students and young professionals face the same challenge: they have ambition, but lack direction. They are overwhelmed by choices, unsure of their strengths, and unable to find someone who truly understands their situation.
              </p>
              <p className="text-gray-500 leading-relaxed mb-5">
                At the same time, there are thousands of experienced professionals who want to give back, share their knowledge, and make a real difference in someone else's career.
              </p>
              <p className="text-gray-500 leading-relaxed">
                GrowVia bridges that gap. We create the conditions for genuine, structured, and impactful mentoring relationships.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">2024</div>
                <div className="text-sm text-gray-500">Year Founded</div>
              </div>
              <div className="bg-violet-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">Paris</div>
                <div className="text-sm text-gray-500">Headquarters</div>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">3</div>
                <div className="text-sm text-gray-500">Languages Supported</div>
              </div>
              <div className="bg-fuchsia-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">Global</div>
                <div className="text-sm text-gray-500">Vision</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-purple-200 font-semibold text-sm mb-4">Our Vision</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            Become the global reference for quality mentoring
          </h2>
          <p className="text-purple-100 text-lg leading-relaxed mb-8">
            We are building more than a platform. We are creating a movement where every ambitious person has access to the guidance they need to reach their full potential.
          </p>
          <div className="inline-block bg-white/10 backdrop-blur rounded-2xl px-8 py-6">
            <p className="text-xl font-light italic text-white">
              "GrowVia is not just mentoring. It is bringing clarity to your future."
            </p>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Meet the Founders</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Two people on a mission to change how the world approaches career guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {founders.map((founder) => (
              <div key={founder.name} className="bg-white rounded-2xl p-8 border border-gray-100 card-shadow">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${founder.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6`}
                >
                  {founder.initials}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{founder.name}</h3>
                <div className="text-sm font-medium text-purple-600 mb-4">{founder.role}</div>
                <p className="text-gray-500 leading-relaxed text-sm">{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What we believe in</h2>
            <p className="text-gray-500 text-lg">The principles that guide every decision we make at GrowVia.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join us on this journey</h2>
          <p className="text-gray-500 mb-8">Whether you want to grow or give back, there is a place for you at GrowVia.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
