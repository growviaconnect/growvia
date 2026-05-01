"use client";

/* Seamless logo ticker, logos rendered as inverted SVG text/wordmarks */

const logos = [
  "Finance",
  "Tech",
  "Marketing",
  "Consulting",
  "Entrepreneuriat",
  "Startups",
  "Private Equity",
  "Venture Capital",
  "Strategy",
  "Business Development",
  "Management",
  "Sales",
  "Product",
  "Growth",
  "Real Estate",
  "Investment Banking",
];

/* Duplicate for seamless loop */
const track = [...logos, ...logos];

export default function LogoTicker() {
  return (
    <div className="py-10 overflow-hidden border-t border-b border-white/[0.05]">
      <div className="animate-ticker flex items-center">
        {track.map((name, i) => (
          <span
            key={i}
            className="mx-12 flex-shrink-0 text-sm font-bold uppercase tracking-widest select-none whitespace-nowrap h-7 flex items-center"
            style={{
              filter: "brightness(0) invert(1)",
              opacity: 0.55,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "0.12em",
            }}
            aria-hidden={i >= logos.length ? "true" : undefined}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
