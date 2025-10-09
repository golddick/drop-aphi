import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, '@prisma/client'];
    }
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Fixed for Next.js 15.5.4 - moved out of experimental
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;