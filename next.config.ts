import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /lander is not the default route — redirect it to the homepage
      {
        source: "/lander",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
