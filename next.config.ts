import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev-only: allow the hosts verification uses (LAN IP, localhost, loopback).
  allowedDevOrigins: ["10.138.117.210", "localhost", "127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
