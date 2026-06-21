export type VideoItem = {
  id: string;
  domain: string;
  name: string;
  role: string;
  quote: string;
  src: string;
  poster: string;
  tall?: boolean;
  autoplay?: boolean;
};

export const DOMAIN_COLORS: Record<string, string> = {
  Startups:      "#7C3AED",
  Tech:          "#2563EB",
  Medicine:      "#059669",
  Law:           "#B45309",
  Art:           "#DB2777",
  Finance:       "#0891B2",
  Consulting:    "#0D9488",
  "Real Estate": "#C2410C",
  Marketing:     "#EA580C",
  Design:        "#0EA5E9",
  Others:        "#6B7280",
};

/** Domains that get their own filter button (everything else → Others) */
export const PRIMARY_DOMAINS = [
  "Startups",
  "Tech",
  "Finance",
  "Marketing",
  "Design",
  "Medicine",
  "Law",
  "Consulting",
] as const;

export const VIDEOS: VideoItem[] = [
  {
    id: "v1", domain: "Startups",
    name: "Sarah M.", role: "Startup Founder",
    quote: "From idea to Series A in 18 months",
    src: "https://videos.pexels.com/video-files/5649491/5649491-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
    tall: true, autoplay: true,
  },
  {
    id: "v2", domain: "Tech",
    name: "Alex K.", role: "Software Engineer",
    quote: "Landed my dream role at a top-tier company",
    src: "https://videos.pexels.com/video-files/1536110/1536110-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
  },
  {
    id: "v3", domain: "Medicine",
    name: "Dr. Chen L.", role: "Chief Resident",
    quote: "Navigating med school with a clear roadmap",
    src: "https://videos.pexels.com/video-files/7578810/7578810-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    tall: true,
  },
  {
    id: "v4", domain: "Finance",
    name: "Marc D.", role: "VC Associate",
    quote: "Breaking into venture capital without connections",
    src: "https://videos.pexels.com/video-files/4475524/4475524-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    autoplay: true,
  },
  {
    id: "v5", domain: "Art",
    name: "Léa V.", role: "Creative Director",
    quote: "Building a creative career that actually pays",
    src: "https://videos.pexels.com/video-files/3571552/3571552-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    tall: true,
  },
  {
    id: "v6", domain: "Law",
    name: "James O.", role: "Corporate Lawyer",
    quote: "From law school to Big Law in under a year",
    src: "https://videos.pexels.com/video-files/6192600/6192600-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
  },
  {
    id: "v7", domain: "Tech",
    name: "Priya S.", role: "Product Manager",
    quote: "PM at a top startup, no CS degree needed",
    src: "https://videos.pexels.com/video-files/5748868/5748868-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    tall: true,
  },
  {
    id: "v8", domain: "Startups",
    name: "Tom B.", role: "Serial Entrepreneur",
    quote: "3 exits before 35, here's how",
    src: "https://videos.pexels.com/video-files/3195777/3195777-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80",
  },
  {
    id: "v9", domain: "Medicine",
    name: "Dr. Aisha R.", role: "Surgeon",
    quote: "Mentorship changed my residency path",
    src: "https://videos.pexels.com/video-files/3985024/3985024-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80",
  },
  {
    id: "v10", domain: "Art",
    name: "Nina C.", role: "Illustrator",
    quote: "Monetizing creativity, finally",
    src: "https://videos.pexels.com/video-files/8097997/8097997-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=600&q=80",
    tall: true,
  },
  {
    id: "v11", domain: "Consulting",
    name: "Emma R.", role: "Strategy Consultant",
    quote: "Made partner at 29, here's the blueprint",
    src: "https://videos.pexels.com/video-files/7988194/7988194-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
    tall: true,
  },
  {
    id: "v12", domain: "Real Estate",
    name: "Omar S.", role: "Property Developer",
    quote: "First deal at 24 with no capital of my own",
    src: "https://videos.pexels.com/video-files/7578043/7578043-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
  {
    id: "v13", domain: "Marketing",
    name: "Jade L.", role: "Growth Marketer",
    quote: "Scaled a brand from 0 to 1M users in 12 months",
    src: "https://videos.pexels.com/video-files/3192154/3192154-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
  },
  {
    id: "v14", domain: "Marketing",
    name: "Lena K.", role: "Brand Strategist",
    quote: "Building brands that actually stick",
    src: "https://videos.pexels.com/video-files/7578544/7578544-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    tall: true,
  },
  {
    id: "v15", domain: "Design",
    name: "Carlos M.", role: "UX Lead",
    quote: "Designing products used by millions",
    src: "https://videos.pexels.com/video-files/7578579/7578579-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    tall: true,
  },
  {
    id: "v16", domain: "Design",
    name: "Sofia R.", role: "Product Designer",
    quote: "From Figma to funding: design as a superpower",
    src: "https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80",
  },
];

// Desktop 4-column layout assignments and vertical stagger offsets
export const GALLERY_COLS: VideoItem[][] = [
  [VIDEOS[0], VIDEOS[7], VIDEOS[10]],
  [VIDEOS[1], VIDEOS[6], VIDEOS[11]],
  [VIDEOS[2], VIDEOS[5], VIDEOS[8]],
  [VIDEOS[3], VIDEOS[4], VIDEOS[9]],
];
export const COL_OFFSETS = [0, 48, 24, 72];
