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
  },
};

export default nextConfig;
