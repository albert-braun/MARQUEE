import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.tvmaze.com",
        pathname: "/uploads/images/**",
      },
    ],
  },
};

export default nextConfig;
