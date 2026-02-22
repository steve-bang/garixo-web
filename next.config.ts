import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        hostname: 'storage.googleapis.com'
      }
    ]
  }
};

export default nextConfig;
