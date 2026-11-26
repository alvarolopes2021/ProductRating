import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Mastra loads native Node modules that the Next.js bundler cannot bundle.
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
