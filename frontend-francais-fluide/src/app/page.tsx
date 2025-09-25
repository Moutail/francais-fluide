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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-b from-primary-900 to-primary-700 bg-clip-text text-transparent">FrançaisFluide</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
              Plateforme professionnelle de correction grammaticale avancée pour l'apprentissage du français
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                size="lg"
                className="px-8 py-4 shadow-md"
              >
                Démarrer l'essai gratuit
              </Button>
              <Button 
                onClick={() => window.location.href = '/demo'}
                variant="secondary"
                size="lg"
                className="px-8 py-4 shadow-sm"
              >
                Voir la démonstration
              </Button>
            </div>
          </div>
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Plans d'Abonnement */}
            <Card className="backdrop-blur-sm bg-white/70 border-white/40 shadow-sm">
              <CardHeader>
                <CardTitle>Plans d'Abonnement (CAD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-xl">
                    <span className="font-medium">Démo Gratuite</span>
                    <span className="text-green-600 font-semibold">Gratuit</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50/80 rounded-xl">
                    <span className="font-medium">Étudiant</span>
                    <span className="text-blue-600 font-semibold">14.99$ CAD/mois</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50/80 rounded-xl">
                    <span className="font-medium">Premium</span>
                    <span className="text-purple-600 font-semibold">29.99$ CAD/mois</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50/80 rounded-xl">
                    <span className="font-medium">Établissement</span>
                    <span className="text-green-600 font-semibold">149.99$ CAD/mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Fonctionnalités */}
            <Card className="backdrop-blur-sm bg-white/70 border-white/40 shadow-sm">
              <CardHeader>
                <CardTitle>Fonctionnalités Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Assistant IA avancé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Corrections en temps réel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Exercices personnalisés</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Analytics détaillées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Mode hors ligne</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Support prioritaire</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-accent-500 to-accent-600 text-white border-transparent rounded-2xl shadow-lg">
            <CardContent className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">
                Prêt à améliorer votre français ?
              </h3>
              <p className="text-blue-100 mb-8 text-lg">
                Rejoignez des milliers d'utilisateurs qui écrivent déjà sans fautes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/subscription'}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 bg-white text-accent-600 hover:bg-gray-50"
                >
                  Voir les abonnements
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
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