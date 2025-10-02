// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (process.env.NODE_ENV === "production") {
      // Loại bỏ folder dev-tool khi build
      config.resolve.alias["/src/app/(layout)/(dev-tool)"] = false;
      config.resolve.alias["/src/services/dev-tool"] = false;
      config.resolve.alias["/src/types/dev-tool"] = false;
      config.resolve.alias["/src/app/api"] = false;
      
    }
    return config;
  },
};

export default nextConfig;
