import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
      
      // Force include the Prisma engine file
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource: (resource: string) => {
            // Only bundle the Linux engine needed for Vercel
            if (resource.includes('/libquery_engine-') && 
                !resource.includes('rhel-openssl-3.0.x')) {
              return true; // Ignore other engines
            }
            return false;
          },
        })
      );
    }
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  
  // Critical for Prisma on Vercel
  output: 'standalone',
};

export default nextConfig;