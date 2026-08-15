import type { NextConfig } from "next";

const API_ORIGIN = process.env.AUTH_API_ORIGIN ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
