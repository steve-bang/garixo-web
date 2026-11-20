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
  },
  async redirects() {
    return [
      {
        source: '/term-of-services',
        destination: '/terms-of-service',
        permanent: true
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'garixo.com' }],
        destination: 'https://www.garixo.com/:path*',
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
