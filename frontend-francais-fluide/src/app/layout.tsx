// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorProvider from '@/components/ErrorProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminBanner from '@/components/admin/AdminBanner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'FrançaisFluide',
    template: '%s - FrançaisFluide',
  },
  description:
    "L'application intelligente qui transforme l'apprentissage du français en une expérience intuitive et engageante. Fini les fautes, bonjour la confiance !",
  keywords: 'français, grammaire, orthographe, apprentissage, IA, correction, exercices',
  authors: [{ name: 'FrançaisFluide Team' }],
  icons: {
    icon: '/icons/francaifluide.svg',
    shortcut: '/icons/francaifluide.svg',
    apple: '/icons/francaifluide.svg',
  },
  openGraph: {
    title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
    description:
      "L'application intelligente qui transforme l'apprentissage du français en une expérience intuitive et engageante.",
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'FrançaisFluide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
    description: "L'application intelligente qui transforme l'apprentissage du français.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const institutionMode = process.env.NEXT_PUBLIC_INSTITUTION_MODE === 'true';
  return (
    <html lang="fr" data-institution={institutionMode ? 'true' : 'false'}>
      <body className="font-sans" data-institution={institutionMode ? 'true' : 'false'}>
        <ErrorBoundary>
          <ErrorProvider>
            <AuthProvider>
              <AdminBanner />
              {children}
            </AuthProvider>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
