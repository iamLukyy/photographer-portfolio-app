import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 768, 960, 1200, 1400],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24, // cache optimized thumbs for a day
    qualities: [60, 75, 85, 100],
  },

  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export default nextConfig;
