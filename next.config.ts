import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "quick-sheep-169.convex.cloud",
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'quick-sheep-169.convex.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
