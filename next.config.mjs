/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCS_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
