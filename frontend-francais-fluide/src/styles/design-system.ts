// src/styles/design-system.ts
// Système de design professionnel pour FrançaisFluide

export const colors = {
  // COULEURS PRIMAIRES
  primary: {
    900: '#0F172A', // Noir bleuté pour textes principaux
    800: '#1E293B', // Headers et titres
    700: '#334155', // Texte secondaire
    600: '#475569', // Texte désactivé
    500: '#64748B', // Bordures et séparateurs
  },

  // ACCENT PROFESSIONNEL (Bleu corporate)
  accent: {
    600: '#1E40AF', // Bleu foncé principal
    500: '#2563EB', // Bleu action
    400: '#3B82F6', // Hover states
    100: '#DBEAFE', // Backgrounds légers
  },

  // SÉMANTIQUE
  semantic: {
    success: '#059669', // Vert professionnel
    warning: '#D97706', // Orange sobre
    error: '#DC2626', // Rouge corporate
    info: '#0891B2', // Cyan informatif
  },

  // NEUTRES
  gray: {
    50: '#FAFAFA', // Backgrounds
    100: '#F5F5F5', // Cards
    200: '#E5E7EB', // Bordures légères
    300: '#D1D5DB', // Bordures
    400: '#9CA3AF', // Texte secondaire
    500: '#6B7280', // Texte désactivé
    600: '#4B5563', // Texte normal
    700: '#374151', // Texte foncé
    800: '#1F2937', // Headers
    900: '#111827', // Texte principal
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const typography = {
  // Familles de polices
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Playfair Display', 'serif'], // Pour h1 uniquement
  },

  // Échelle typographique
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  // Espacements basés sur 8px
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px',
} as const;

export const transitions = {
  // Transitions subtiles uniquement
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
} as const;

// Configuration Tailwind personnalisée
export const tailwindConfig = {
  theme: {
    extend: {
      colors,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      fontWeight: typography.fontWeight,
      spacing,
      boxShadow: shadows,
      borderRadius,
      transitionDuration: transitions,
    },
  },
} as const;

// Classes CSS utilitaires pour le design professionnel
export const professionalClasses = {
  // Cards
  card: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  cardHover: 'hover:shadow-md transition-shadow duration-200',

  // Buttons
  buttonPrimary:
    'bg-accent-500 text-white px-4 py-2 rounded-md font-medium hover:bg-accent-400 transition-colors duration-200',
  buttonSecondary:
    'bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200',
  buttonGhost:
    'text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200',

  // Inputs
  input:
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',

  // Text
  heading1: 'text-4xl font-bold text-primary-900 font-display',
  heading2: 'text-3xl font-semibold text-primary-800',
  heading3: 'text-2xl font-semibold text-primary-800',
  heading4: 'text-xl font-medium text-primary-700',
  body: 'text-base text-primary-700',
  caption: 'text-sm text-primary-600',

  // Layout
  container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
} as const;
