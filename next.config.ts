import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

const nextConfig: NextConfig = {
  async rewrites() {
    if (isDev) {
      return [
        {
          source: "/dev-tool/:path*",
          destination: "/dev/dev-tool/:path*", // trỏ sang thư mục src/dev/(dev-tool)/dev-tool
        },
      ]
    }
    return []
  },
}

export default nextConfig
