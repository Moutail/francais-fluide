import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimisations de performance et stabilité
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Configuration webpack pour éviter les erreurs de chunks
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Évite les timeout de chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            chunks: 'all',
          },
        },
      },
    };

    // Timeout plus long pour le chargement des chunks
    config.output.chunkLoadTimeout = 30000;

    return config;
  },

  // Headers pour améliorer le cache
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimisations images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // PoweredBy header supprimé pour sécurité
  poweredByHeader: false,

  // React strict mode pour détecter les problèmes
  reactStrictMode: true,
};

export default nextConfig;
