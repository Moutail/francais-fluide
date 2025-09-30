'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="mb-4 text-9xl font-bold text-blue-100">404</div>
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <Search className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        {/* Contenu */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Page non trouvée</h1>
          <p className="mb-6 text-gray-600">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Page précédente
            </button>
          </div>

          {/* Liens utiles */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="mb-4 text-sm text-gray-500">Liens utiles :</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-100"
              >
                Dashboard
              </Link>
              <Link
                href="/exercices"
                className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-600 transition-colors hover:bg-green-100"
              >
                Exercices
              </Link>
              <Link
                href="/support"
                className="rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-600 transition-colors hover:bg-purple-100"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
