import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/local-reports/:slug",
        destination: "/local-reports/report/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
