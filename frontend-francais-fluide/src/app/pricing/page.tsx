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
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plans d'abonnement
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le plan qui correspond le mieux à vos besoins d'apprentissage du français
            </p>
          </div>

          {/* Pricing Component */}
          <ProfessionalPricing />

          {/* Features Comparison */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Comparaison des fonctionnalités
            </h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fonctionnalités
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Démo Gratuite
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Étudiant
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Premium
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Établissement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Corrections de base
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Documents par mois
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          Illimités
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          Illimités
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          Illimités
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Assistant IA avancé
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Analytics détaillées
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Support prioritaire
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-gray-400">—</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
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
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Questions fréquentes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Puis-je changer de plan à tout moment ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, vous pouvez changer de plan à tout moment. Les modifications prendront effet au début de votre prochain cycle de facturation.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Y a-t-il une garantie de remboursement ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Nous offrons une garantie de remboursement de 30 jours sur tous nos plans payants. Si vous n'êtes pas satisfait, contactez-nous.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mes données sont-elles sécurisées ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolument. Nous utilisons un chiffrement de bout en bout et respectons les normes de sécurité les plus strictes pour protéger vos données.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Puis-je utiliser l'application hors ligne ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oui, avec les plans Étudiant, Premium et Établissement, vous pouvez télécharger vos documents pour les utiliser hors ligne.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-20 text-center">
            <Card className="bg-blue-600 text-white border-blue-600">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à améliorer votre français ?
                </h3>
                <p className="text-blue-100 mb-8 text-lg">
                  Rejoignez des milliers d'utilisateurs qui font déjà confiance à FrançaisFluide
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-50"
                  >
                    Commencer l'essai gratuit
                  </Button>
                  <Button 
                    variant="ghost"
                    size="lg"
                    className="px-8 py-4 text-white border-white hover:bg-blue-700"
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
