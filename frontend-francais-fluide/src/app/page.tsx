// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleAIAssistant } from '@/components/ai/SimpleAIAssistant';
import Navigation from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Check, Users, Zap, Shield, Globe, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger les utilisateurs connectés vers le dashboard approprié
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      // Rediriger les admins vers l'interface d'administration
      if (user.role && ['admin', 'super_admin'].includes(user.role)) {
        window.location.href = '/admin';
      } else {
        // Rediriger les utilisateurs normaux vers le dashboard
        window.location.href = '/dashboard';
      }
    }
  }, [mounted, isAuthenticated, user]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne pas afficher cette page
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-b from-primary-900 to-primary-700 bg-clip-text text-transparent">
                FrançaisFluide
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-balance text-xl text-gray-600">
              Plateforme professionnelle de correction grammaticale avancée pour l'apprentissage du
              français
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => (window.location.href = '/auth/login')}
                size="lg"
                className="px-8 py-4 shadow-md"
              >
                Démarrer l'essai gratuit
              </Button>
              <Button
                onClick={() => (window.location.href = '/demo')}
                variant="secondary"
                size="lg"
                className="px-8 py-4 shadow-sm"
              >
                Voir la démonstration
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Plans d'Abonnement */}
            <Card className="border-white/40 bg-white/70 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Plans d'Abonnement (CAD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50/80 p-4">
                    <span className="font-medium">Démo Gratuite</span>
                    <span className="font-semibold text-green-600">Gratuit</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-blue-50/80 p-4">
                    <span className="font-medium">Étudiant</span>
                    <span className="font-semibold text-blue-600">14.99$ CAD/mois</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-purple-50/80 p-4">
                    <span className="font-medium">Premium</span>
                    <span className="font-semibold text-purple-600">29.99$ CAD/mois</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-green-50/80 p-4">
                    <span className="font-medium">Établissement</span>
                    <span className="font-semibold text-green-600">149.99$ CAD/mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fonctionnalités */}
            <Card className="border-white/40 bg-white/70 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Fonctionnalités Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Assistant IA avancé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Corrections en temps réel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Exercices personnalisés</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Analytics détaillées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Mode hors ligne</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Support prioritaire</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="rounded-2xl border-transparent bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg">
            <CardContent className="py-12 text-center">
              <h3 className="mb-4 text-2xl font-bold">Prêt à améliorer votre français ?</h3>
              <p className="mb-8 text-lg text-blue-100">
                Rejoignez des milliers d'utilisateurs qui écrivent déjà sans fautes
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  onClick={() => (window.location.href = '/subscription')}
                  variant="secondary"
                  size="lg"
                  className="bg-white px-8 py-4 text-accent-600 hover:bg-gray-50"
                >
                  Voir les abonnements
                </Button>
                <Button
                  onClick={() => (window.location.href = '/auth/login')}
                  variant="ghost"
                  size="lg"
                  className="px-8 py-4 text-white hover:bg-white/10"
                >
                  Commencer gratuitement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assistant IA Widget */}
      <SimpleAIAssistant userPlan="free" />
    </div>
  );
}
