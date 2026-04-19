const PHRASES = [
  "Growing fast and learning every day.",
  "Real, honest human connections.",
  "Staying adaptable and always moving forward.",
  "Creating real and meaningful impact.",
];

export default function ManifestoSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "brightness(0.4) saturate(0.6)" }}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative text-center px-6 max-w-4xl mx-auto py-32">
        <p
          className="animate-fade-up text-xs font-semibold text-[#A78BFA] uppercase tracking-[0.25em] mb-14"
          style={{ animationDelay: "0.1s" }}
        >
          We Believe In
        </p>

        <div className="space-y-7">
          {PHRASES.map((phrase, i) => (
            <p
              key={i}
              className="animate-fade-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              style={{ animationDelay: `${0.25 + i * 0.35}s` }}
            >
              {phrase}
            </p>
          ))}
        </div>

        <div
          className="animate-fade-up mt-14"
          style={{ animationDelay: `${0.25 + PHRASES.length * 0.35 + 0.2}s` }}
        >
          <a
            href="/#manifesto"
            className="inline-flex items-center gap-2 bg-white text-[#0D0A1A] font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Read our manifesto →
          </a>
        </div>
      </div>
    </section>
  );
}
