/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration webpack optimisée
  webpack: (config, { dev, isServer }) => {
    // Ignorer les erreurs de PostCSS pour @tailwindcss/postcss
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@tailwindcss/postcss': false,
    };

    // Optimisations de production
    if (!dev) {
      // Minimiser le JavaScript
      config.optimization.minimize = true;
      
      // Optimiser les chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Chunk pour les librairies React
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          // Chunk pour les animations
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion|lottie-react)[\\/]/,
            name: 'animations',
            priority: 15,
            chunks: 'all',
          },
          // Chunk pour les utilitaires
          utils: {
            test: /[\\/]node_modules[\\/](lodash|moment|date-fns|uuid)[\\/]/,
            name: 'utils',
            priority: 10,
            chunks: 'all',
          },
          // Chunk pour les composants UI
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui|class-variance-authority)[\\/]/,
            name: 'ui',
            priority: 12,
            chunks: 'all',
          },
          // Chunk pour les autres librairies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 5,
            chunks: 'all',
            minSize: 10000,
          },
        },
      };

      // Optimiser les modules
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    return config;
  },

  // Configuration de compilation
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Configuration des images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 an
  },

  // Configuration de compression
  compress: true,

  // Configuration des headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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

  // Configuration de redirection
  async redirects() {
    return [
      // Redirections pour l'optimisation SEO
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Configuration de réécriture
  async rewrites() {
    return [
      // API routes
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Configuration expérimentale
  experimental: {
    // Optimisations de performance
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    
    // Turbopack en développement
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Configuration des types
  typescript: {
    // Ignorer les erreurs TypeScript en production si nécessaire
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Configuration ESLint
  eslint: {
    // Ignorer les erreurs ESLint en production si nécessaire
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // Configuration de sortie
  output: 'standalone',

  // Configuration de la base de données
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configuration des variables publiques
  publicRuntimeConfig: {
    // Variables disponibles côté client
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configuration du serveur
  serverRuntimeConfig: {
    // Variables disponibles côté serveur uniquement
    secret: process.env.SECRET,
  },

  // Configuration de la génération statique
  generateBuildId: async () => {
    // Générer un ID de build unique
    return `build-${Date.now()}`;
  },

  // Configuration des pages
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Configuration des assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '/francais-fluide' : '',

  // Configuration de la transpilation
  transpilePackages: [
    'lucide-react',
    '@radix-ui/react-icons',
    'framer-motion',
  ],

  // Configuration de la modularisation
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{kebabCase member}}.js',
      skipDefaultConversion: true,
    },
  },

  // Configuration des bundles
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
  },

  // Configuration des performances
  onDemandEntries: {
    // Période d'inactivité avant de fermer les pages
    maxInactiveAge: 25 * 1000,
    // Nombre de pages à garder en mémoire
    pagesBufferLength: 2,
  },

  // Configuration de la compression
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Configuration des tests
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Configuration des variables d'environnement
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },
};

export default nextConfig;
