/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    // Ignorer les erreurs de PostCSS pour @tailwindcss/postcss
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@tailwindcss/postcss': false,
    };
    return config;
  },
  // Désactiver SWC pour éviter les conflits avec Babel
  swcMinify: false,
  // Configuration des métadonnées
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  },
  async rewrites() {
    // En production, si un backend externe est fourni, on proxifie /api/*
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
