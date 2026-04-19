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

const tickerItems = [
  "Harvard University", "Stanford", "HEC Paris", "ESSEC",
  "IE Business School", "London Business School", "McKinsey", "Google",
  "Meta", "Salesforce", "BNP Paribas", "L'Oréal", "Spotify", "Airbnb",
  "Y Combinator", "Station F", "Sciences Po", "Polytechnique", "MIT", "Oxford",
];

export default function StatsSection() {
  return (
    <section className="py-32 border-t border-white/5">

      {/* ── Title + Stats ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Title */}
        <div className="max-w-3xl mb-20">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-7"
          >
            From early momentum to{" "}
            <span style={serifStyle}>global</span>
            {" "}awareness.
          </h2>
          <p className="text-lg text-white/40 leading-relaxed">
            Our network of mentors spans world-class professionals, entrepreneurs, and experts —
            people who shape careers, shift perspectives, and open doors.
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.badge}
              className="py-12 px-8 flex flex-col"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : undefined,
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.07)" : undefined,
              }}
            >
              {/* Pill badge */}
              <span
                className="self-start text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 rounded-full px-3 py-1 mb-8"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {stat.badge}
              </span>

              {/* Number */}
              <div
                className="text-white leading-none tracking-tight mb-3"
                style={{ fontSize: "clamp(56px, 8vw, 120px)", fontWeight: 200 }}
              >
                {stat.number}
              </div>

              {/* Description */}
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ticker ── */}
      <div
        className="mt-20 overflow-hidden py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="animate-ticker flex items-center gap-0">
          {[...tickerItems, ...tickerItems].map((name, i) => (
            <div key={i} className="flex items-center gap-4 flex-shrink-0 px-8">
              {/* Logo placeholder */}
              <div
                className="w-6 h-6 rounded flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <span className="text-sm text-white/40 whitespace-nowrap font-medium">
                {name}
              </span>
              {/* Separator dot */}
              <span className="text-white/15 ml-4 flex-shrink-0">·</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
