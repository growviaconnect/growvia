"use client";

const serifStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic" as const,
  fontWeight: 400,
};

const stats = [
  { badge: "Mentors",  number: "500+",    desc: "Expert Mentors" },
  { badge: "Mentees",  number: "2,000+",  desc: "Ambitious Learners" },
  { badge: "Sessions", number: "10,000+", desc: "Sessions Completed" },
  { badge: "Success",  number: "95%",     desc: "Satisfaction Rate" },
];

const logos = [
  { name: "Olympics",           url: "https://logo.clearbit.com/olympics.com" },
  { name: "Oscars",             url: "https://logo.clearbit.com/oscars.org" },
  { name: "Y Combinator",       url: "https://logo.clearbit.com/ycombinator.com" },
  { name: "ATP Tour",           url: "https://logo.clearbit.com/atptour.com" },
  { name: "BAFTA",              url: "https://logo.clearbit.com/bafta.org" },
  { name: "UEFA",               url: "https://logo.clearbit.com/uefa.com" },
  { name: "Premier League",     url: "https://logo.clearbit.com/premierleague.com" },
  { name: "Formula 1",          url: "https://logo.clearbit.com/formula1.com" },
  { name: "NBA",                url: "https://logo.clearbit.com/nba.com" },
  { name: "NFL",                url: "https://logo.clearbit.com/nfl.com" },
  { name: "Harvard",            url: "https://logo.clearbit.com/harvard.edu" },
  { name: "Stanford",           url: "https://logo.clearbit.com/stanford.edu" },
  { name: "HEC Paris",          url: "https://logo.clearbit.com/hec.edu" },
  { name: "Google",             url: "https://logo.clearbit.com/google.com" },
  { name: "McKinsey",           url: "https://logo.clearbit.com/mckinsey.com" },
  { name: "Spotify",            url: "https://logo.clearbit.com/spotify.com" },
];

export default function StatsSection() {
  return (
    <section>

      {/* ── Title + Subtitle ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-7">
            From early momentum to{" "}
            <span style={serifStyle}>global</span>
            {" "}awareness.
          </h2>
          <p className="reveal reveal-delay-1 text-lg text-white/40 leading-relaxed">
            Our network of mentors spans world-class professionals, entrepreneurs, and experts —
            people who shape careers, shift perspectives, and open doors.
          </p>
        </div>
      </div>

      {/* ── Stats right-aligned ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-end">
          {stats.map((stat, i) => (
            <div
              key={stat.badge}
              className={`reveal reveal-delay-${i + 1} px-8 lg:px-12 pt-8 pb-14 flex flex-col items-center text-center`}
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Pill badge */}
              <span
                className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-6"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {stat.badge}
              </span>

              {/* Number */}
              <div
                className="text-white leading-none tracking-tight mb-2.5"
                style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 200 }}
              >
                {stat.number}
              </div>

              {/* Description */}
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logo ticker ── */}
      <div className="reveal py-10 overflow-hidden mt-4">
        <div className="animate-ticker flex items-center">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex-shrink-0 mx-12">
              <img
                src={logo.url}
                alt={logo.name}
                className="h-7 w-auto"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.55 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
