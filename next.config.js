/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standard webpack for better Windows compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks for Node core modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Ignore handlebars in client bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^handlebars$/,
        })
      );
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://*.google-analytics.com https://unpkg.com https://cdn.jsdelivr.net https://*.googleapis.com https://va.vercel-scripts.com https://vercel.live",
              "child-src https://www.youtube.com",
              "frame-src 'self' https://www.youtube.com https://youtube.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https: http: https://firebasestorage.googleapis.com https://picsum.photos https://placehold.co",
              "media-src 'self' data: blob: https: http: https://firebasestorage.googleapis.com",
              "connect-src 'self' https://*.googleapis.com https://prod.spline.design https://www.google-analytics.com https://*.googletagmanager.com https://vitals.vercel-insights.com",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "object-src 'none'",
              "base-uri 'self'"
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: 'autoplay=(self https://firebasestorage.googleapis.com), camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

// This is required to load the .env.local file.
require("dotenv").config({ path: "./.env.local" });

module.exports = nextConfig;
