/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignorer les erreurs de PostCSS pour @tailwindcss/postcss
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@tailwindcss/postcss': false,
    };
    return config;
  },
};

export default nextConfig;
