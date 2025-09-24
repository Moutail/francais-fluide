// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

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
  const institutionMode = process.env.NEXT_PUBLIC_INSTITUTION_MODE === 'true';
  return (
    <html lang="fr" data-institution={institutionMode ? 'true' : 'false'}>
      <body className="font-sans" data-institution={institutionMode ? 'true' : 'false'}>
        {children}
      </body>
    </html>
  );
}