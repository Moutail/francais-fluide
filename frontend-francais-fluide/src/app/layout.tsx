// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
  description: 'L\'application intelligente qui transforme l\'apprentissage du français en une expérience intuitive et engageante. Fini les fautes, bonjour la confiance !',
  keywords: 'français, grammaire, orthographe, apprentissage, IA, correction, exercices',
  authors: [{ name: 'FrançaisFluide Team' }],
  openGraph: {
    title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
    description: 'L\'application intelligente qui transforme l\'apprentissage du français en une expérience intuitive et engageante.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrançaisFluide - Écrivez sans fautes, naturellement',
    description: 'L\'application intelligente qui transforme l\'apprentissage du français.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}