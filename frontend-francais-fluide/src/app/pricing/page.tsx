// src/app/pricing/page.tsx
'use client';

import React from 'react';
import Navigation from '@/components/layout/Navigation';
import { ProfessionalPricing } from '@/components/pricing/ProfessionalPricing';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Check, Shield, Clock, Users, Zap } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Plans d'abonnement</h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Choisissez le plan qui correspond le mieux à vos besoins d'apprentissage du français
            </p>
          </div>

          {/* Pricing Component */}
          <ProfessionalPricing />

          {/* Features Comparison */}
          <div className="mt-20">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Comparaison des fonctionnalités
            </h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Fonctionnalités
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                          Démo Gratuite
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                          Étudiant
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                          Premium
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                          Établissement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          Corrections de base
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          Documents par mois
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                          5
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                          Illimités
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                          Illimités
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                          Illimités
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          Assistant IA avancé
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          Analytics détaillées
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          Support prioritaire
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Questions fréquentes
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Puis-je changer de plan à tout moment ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, vous pouvez changer de plan à tout moment. Les modifications prendront
                    effet au début de votre prochain cycle de facturation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Y a-t-il une garantie de remboursement ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Nous offrons une garantie de remboursement de 30 jours sur tous nos plans
                    payants. Si vous n'êtes pas satisfait, contactez-nous.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mes données sont-elles sécurisées ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolument. Nous utilisons un chiffrement de bout en bout et respectons les
                    normes de sécurité les plus strictes pour protéger vos données.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Puis-je utiliser l'application hors ligne ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, avec les plans Étudiant, Premium et Établissement, vous pouvez télécharger
                    vos documents pour les utiliser hors ligne.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-20 text-center">
            <Card className="border-blue-600 bg-blue-600 text-white">
              <CardContent className="py-12">
                <h3 className="mb-4 text-2xl font-bold">Prêt à améliorer votre français ?</h3>
                <p className="mb-8 text-lg text-blue-100">
                  Rejoignez des milliers d'utilisateurs qui font déjà confiance à FrançaisFluide
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white px-8 py-4 text-blue-600 hover:bg-gray-50"
                  >
                    Commencer l'essai gratuit
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border-white px-8 py-4 text-white hover:bg-blue-700"
                  >
                    Contacter le support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
