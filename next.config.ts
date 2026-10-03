import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCS_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
