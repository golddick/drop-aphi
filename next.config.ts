import type { NextConfig } from "next";
import { IgnorePlugin } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "@prisma/client"];

      config.plugins.push(
        new IgnorePlugin({
          checkResource: (resource: string) => {
            if (
              resource.includes("/libquery_engine-") &&
              !resource.includes("rhel-openssl-3.0.x")
            ) {
              return true;
            }
            return false;
          },
        })
      );
    }

    return config;
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ["@prisma/client"],
  output: "standalone",
};

export default nextConfig;
