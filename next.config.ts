import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ivjcwulrmxqexytudhtu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
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
