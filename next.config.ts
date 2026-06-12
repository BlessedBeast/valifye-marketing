import type { NextConfig } from "next";

import { buildPseoRedirects } from "./lib/pseo-redirects";

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
    const pseoRedirects = await buildPseoRedirects();

    return [
      {
        source: "/local-reports/:slug",
        destination: "/local-reports/report/:slug",
        permanent: true,
      },
      ...pseoRedirects,
    ];
  },
};

export default nextConfig;
