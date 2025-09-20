/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de production
  output: 'standalone',
  
  // Compression et optimisation
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuration webpack optimisée pour la production
  webpack: (config, { dev, isServer }) => {
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
          // Chunk pour les outils IA
          ai: {
            test: /[\\/]src[\\/]lib[\\/]ai[\\/]/,
            name: 'ai',
            priority: 18,
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

    // Ignorer les erreurs de PostCSS
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@tailwindcss/postcss': false,
    };

    return config;
  },

  // Configuration des images optimisées
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 an
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      'images.unsplash.com',
      'via.placeholder.com'
    ],
  },

  // Configuration de compilation
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Sécurité de base
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.languagetool.org https://www.google-analytics.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Cache pour les assets statiques
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
      // Cache pour les images
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Pas de cache pour les pages
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
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
      {
        source: '/login',
        destination: '/auth/login',
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
      // Rewrites pour l'optimisation
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },

  // Configuration expérimentale
  experimental: {
    // Optimisations de performance
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'framer-motion'
    ],
    
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
    ignoreBuildErrors: process.env.IGNORE_TYPESCRIPT_ERRORS === 'true',
  },

  // Configuration ESLint
  eslint: {
    // Ignorer les erreurs ESLint en production si nécessaire
    ignoreDuringBuilds: process.env.IGNORE_ESLINT_ERRORS === 'true',
  },

  // Configuration de la base de données
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Configuration des variables publiques
  publicRuntimeConfig: {
    // Variables disponibles côté client
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appVersion: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  },

  // Configuration du serveur
  serverRuntimeConfig: {
    // Variables disponibles côté serveur uniquement
    secret: process.env.SECRET,
    databaseUrl: process.env.DATABASE_URL,
  },

  // Configuration de la génération statique
  generateBuildId: async () => {
    // Générer un ID de build unique
    return `build-${Date.now()}`;
  },

  // Configuration des pages
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Configuration des assets (pour Vercel)
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.CDN_URL 
    ? process.env.CDN_URL 
    : '',

  // Configuration de la transpilation
  transpilePackages: [
    'lucide-react',
    '@radix-ui/react-icons',
    'framer-motion',
    'react-window',
    'react-window-infinite-loader',
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

  // Configuration des bundles (pour l'analyse)
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

  // Configuration CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://francais-fluide.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
