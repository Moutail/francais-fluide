'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Lock, 
  Crown, 
  Star, 
  GraduationCap, 
  Building,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useApi';
import { hasAccess, canAccessPage, getPlanLimits, SUBSCRIPTION_PLANS } from '@/lib/subscription/accessControl';
import { cn } from '@/lib/utils/cn';

interface TestResult {
  feature: string;
  hasAccess: boolean;
  required: string;
  status: 'success' | 'error' | 'warning';
}

const PLAN_ICONS = {
  demo: Lock,
  etudiant: GraduationCap,
  premium: Star,
  etablissement: Building
};

const PLAN_COLORS = {
  demo: 'text-gray-600 bg-gray-100',
  etudiant: 'text-blue-600 bg-blue-100',
  premium: 'text-purple-600 bg-purple-100',
  etablissement: 'text-orange-600 bg-orange-100'
};

export default function TestSubscriptionPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    { name: 'Corrections IA de base', feature: 'aiCorrections', required: 'demo' },
    { name: 'Exercices quotidiens', feature: 'exercisesPerDay', required: 'demo' },
    { name: 'Analytics avancées', feature: 'advancedAnalytics', required: 'etudiant' },
    { name: 'Export des données', feature: 'exportData', required: 'etudiant' },
    { name: 'Support prioritaire', feature: 'prioritySupport', required: 'etudiant' },
    { name: 'Dictées audio', feature: 'dictationsPerDay', required: 'etudiant' },
    { name: 'Exercices personnalisés', feature: 'customExercises', required: 'premium' },
    { name: 'Mode hors ligne', feature: 'offlineMode', required: 'premium' },
    { name: 'API complète', feature: 'apiAccess', required: 'premium' },
    { name: 'Gestion multi-utilisateurs', feature: 'multiUserManagement', required: 'etablissement' }
  ];

  const pages = [
    { name: 'Page d\'accueil', page: 'home', required: 'demo' },
    { name: 'Exercices', page: 'exercises', required: 'demo' },
    { name: 'Analytics', page: 'analytics', required: 'etudiant' },
    { name: 'API Documentation', page: 'api', required: 'premium' },
    { name: 'Administration', page: 'admin', required: 'etablissement' }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      runTests();
    }
  }, [isAuthenticated, user]);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    const userPlan = user?.subscription?.plan || 'demo';

    // Test des fonctionnalités
    for (const feature of features) {
      const hasAccessToFeature = hasAccess(userPlan, feature.feature as any);
      const planHierarchy = { demo: 0, etudiant: 1, premium: 2, etablissement: 3 };
      const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
      const requiredLevel = planHierarchy[feature.required as keyof typeof planHierarchy] || 0;
      
      let status: 'success' | 'error' | 'warning' = 'success';
      if (userLevel < requiredLevel) {
        status = 'error';
      } else if (userLevel === requiredLevel) {
        status = 'warning';
      }

      results.push({
        feature: feature.name,
        hasAccess: hasAccessToFeature,
        required: feature.required,
        status
      });
    }

    // Test des pages
    for (const page of pages) {
      const canAccess = canAccessPage(userPlan, page.page);
      const planHierarchy = { demo: 0, etudiant: 1, premium: 2, etablissement: 3 };
      const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
      const requiredLevel = planHierarchy[page.required as keyof typeof planHierarchy] || 0;
      
      let status: 'success' | 'error' | 'warning' = 'success';
      if (userLevel < requiredLevel) {
        status = 'error';
      } else if (userLevel === requiredLevel) {
        status = 'warning';
      }

      results.push({
        feature: page.name,
        hasAccess: canAccess,
        required: page.required,
        status
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return Lock;
      default: return Lock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour tester les abonnements
          </p>
          <a
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  const userPlan = user?.subscription?.plan || 'demo';
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
  const PlanIcon = PLAN_ICONS[userPlan as keyof typeof PLAN_ICONS];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des Abonnements
          </h1>
          <p className="text-gray-600">
            Vérification des accès selon votre niveau d'abonnement
          </p>
        </div>

        {/* Informations utilisateur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                PLAN_COLORS[userPlan as keyof typeof PLAN_COLORS]
              )}>
                <PlanIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-2",
                  PLAN_COLORS[userPlan as keyof typeof PLAN_COLORS]
                )}>
                  <PlanIcon className="w-4 h-4" />
                  {currentPlan?.name}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Niveau d'accès</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan?.price} {currentPlan?.currency}/mois
              </p>
            </div>
          </div>
        </motion.div>

        {/* Boutons de contrôle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <button
            onClick={runTests}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
              isRunning
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            )}
          >
            <RefreshCw className={cn("w-5 h-5", isRunning && "animate-spin")} />
            {isRunning ? 'Test en cours...' : 'Relancer les tests'}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showDetails ? 'Masquer détails' : 'Afficher détails'}
          </button>
        </motion.div>

        {/* Résultats des tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Résultats des Tests
            </h3>
            <p className="text-sm text-gray-600">
              {testResults.length} fonctionnalités testées
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {testResults.map((result, index) => {
              const StatusIcon = getStatusIcon(result.status);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        getStatusColor(result.status)
                      )}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {result.feature}
                        </p>
                        {showDetails && (
                          <p className="text-sm text-gray-500">
                            Requis: {result.required} | 
                            Accès: {result.hasAccess ? 'Oui' : 'Non'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getStatusColor(result.status)
                      )}>
                        {result.status === 'success' && 'Accès autorisé'}
                        {result.status === 'error' && 'Accès refusé'}
                        {result.status === 'warning' && 'Accès limité'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Comptes de test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comptes de Test Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { email: 'demo@test.com', plan: 'Démo', color: 'bg-gray-100 text-gray-800' },
              { email: 'etudiant@test.com', plan: 'Étudiant', color: 'bg-blue-100 text-blue-800' },
              { email: 'premium@test.com', plan: 'Premium', color: 'bg-purple-100 text-purple-800' },
              { email: 'etablissement@test.com', plan: 'Établissement', color: 'bg-orange-100 text-orange-800' }
            ].map((account, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2",
                  account.color
                )}>
                  {React.createElement(PLAN_ICONS[account.plan.toLowerCase() as keyof typeof PLAN_ICONS] || Lock, { className: "w-4 h-4" })}
                  {account.plan}
                </div>
                <p className="text-sm text-gray-600 mb-1">{account.email}</p>
                <p className="text-xs text-gray-500">Mot de passe: Test!1234</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
