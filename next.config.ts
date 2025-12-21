import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Required for Polotno SDK compatibility
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'polotno',
    ],
  },
};

export default nextConfig;
