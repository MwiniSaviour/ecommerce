import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  // Dev-only: allow the hosts verification uses (LAN IP, localhost, loopback).
  allowedDevOrigins: ["10.138.117.210", "172.28.80.56", "localhost", "127.0.0.1"],
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
