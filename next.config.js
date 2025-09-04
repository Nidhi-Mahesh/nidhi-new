
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com; child-src https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com https://picsum.photos; connect-src 'self' https://*.googleapis.com; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

// This is required to load the .env.local file.
require('dotenv').config({ path: './.env.local' });

module.exports = nextConfig;
