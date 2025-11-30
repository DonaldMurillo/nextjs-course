import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // Update this to match your GitHub repository name
  // e.g., if your repo is github.com/username/nextjs-course, use "/nextjs-course"
  basePath: isProd ? "/nextjs-course" : "",
  assetPrefix: isProd ? "/nextjs-course/" : "",
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
};

export default nextConfig;
