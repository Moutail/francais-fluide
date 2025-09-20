// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
  description: 'L\'application intelligente qui transforme l\'apprentissage du français en une expérience intuitive et engageante.',
  keywords: 'français, grammaire, orthographe, apprentissage, correction, éducation',
  authors: [{ name: 'FrançaisFluide Team' }],
  openGraph: {
    title: 'FrançaisFluide - Maîtrisez le français sans effort',
    description: 'Apprenez à écrire parfaitement en français avec notre IA adaptative',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://francaisfluide.com',
    siteName: 'FrançaisFluide',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FrançaisFluide - Application d\'apprentissage du français',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrançaisFluide',
    description: 'Écrivez sans fautes avec notre IA adaptative',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}