'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Award
} from 'lucide-react';

export default function GuidePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('getting-started');

  // Rediriger les utilisateurs non connectés
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  const sections = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: PlayCircle,
      content: [
        {
          title: 'Première connexion',
          steps: [
            'Créez votre compte ou connectez-vous',
            'Choisissez votre plan d\'abonnement',
            'Complétez votre profil utilisateur',
            'Explorez le tableau de bord principal'
          ]
        },
        {
          title: 'Configuration initiale',
          steps: [
            'Définissez votre niveau de français',
            'Sélectionnez vos objectifs d\'apprentissage',
            'Configurez vos préférences de notification',
            'Explorez les différents types d\'exercices'
          ]
        }
      ]
    },
    {
      id: 'exercises',
      title: 'Exercices et pratique',
      icon: Target,
      content: [
        {
          title: 'Types d\'exercices disponibles',
          steps: [
            'Exercices de grammaire adaptatifs',
            'Dictées audio avec correction automatique',
            'Exercices de vocabulaire contextuel',
            'Génération d\'exercices personnalisés par IA'
          ]
        },
        {
          title: 'Comment utiliser les exercices',
          steps: [
            'Sélectionnez un exercice depuis la page Exercices',
            'Lisez attentivement les instructions',
            'Répondez aux questions dans le temps imparti',
            'Consultez vos résultats et corrections détaillées'
          ]
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'Fonctionnalités IA',
      icon: Zap,
      content: [
        {
          title: 'Chat IA intelligent',
          steps: [
            'Posez des questions sur la grammaire française',
            'Demandez des explications détaillées',
            'Obtenez des conseils personnalisés',
            'L\'IA s\'adapte à votre niveau et vos erreurs'
          ]
        },
        {
          title: 'Génération d\'exercices personnalisés',
          steps: [
            'Accédez au générateur d\'exercices IA',
            'Sélectionnez vos domaines de focus',
            'Choisissez le niveau de difficulté',
            'Générez des exercices adaptés à vos besoins'
          ]
        }
      ]
    },
    {
      id: 'progress-tracking',
      title: 'Suivi des progrès',
      icon: BarChart3,
      content: [
        {
          title: 'Tableau de bord de progression',
          steps: [
            'Consultez vos statistiques détaillées',
            'Suivez votre précision moyenne',
            'Visualisez votre temps d\'étude',
            'Débloquez des succès et objectifs'
          ]
        },
        {
          title: 'Analytics et recommandations',
          steps: [
            'Analysez vos erreurs récurrentes',
            'Recevez des recommandations personnalisées',
            'Identifiez vos points forts et faiblesses',
            'Adaptez votre plan d\'apprentissage'
          ]
        }
      ]
    },
    {
      id: 'editor',
      title: 'Éditeur intelligent',
      icon: FileText,
      content: [
        {
          title: 'Fonctionnalités de l\'éditeur',
          steps: [
            'Écrivez vos textes avec assistance IA',
            'Correction grammaticale en temps réel',
            'Suggestions de vocabulaire et style',
            'Analyse de la complexité de vos textes'
          ]
        },
        {
          title: 'Comment utiliser l\'éditeur',
          steps: [
            'Accédez à l\'éditeur depuis le menu principal',
            'Commencez à taper votre texte',
            'Consultez les suggestions en temps réel',
            'Sauvegardez vos documents pour référence future'
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: 'Paramètres et personnalisation',
      icon: Settings,
      content: [
        {
          title: 'Gestion du compte',
          steps: [
            'Modifiez vos informations personnelles',
            'Changez votre mot de passe',
            'Gérez vos préférences de notification',
            'Exportez vos données si nécessaire'
          ]
        },
        {
          title: 'Gestion de l\'abonnement',
          steps: [
            'Consultez votre plan actuel',
            'Modifiez votre abonnement',
            'Gérez vos informations de facturation',
            'Annulez votre abonnement si nécessaire'
          ]
        }
      ]
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: 'Conseil pratique',
      content: 'Pratiquez régulièrement, même 10 minutes par jour, pour de meilleurs résultats.'
    },
    {
      icon: Target,
      title: 'Objectif SMART',
      content: 'Définissez des objectifs spécifiques et mesurables pour votre apprentissage.'
    },
    {
      icon: BarChart3,
      title: 'Suivi des progrès',
      content: 'Consultez régulièrement vos statistiques pour identifier vos points d\'amélioration.'
    },
    {
      icon: MessageSquare,
      title: 'Utilisez l\'IA',
      content: 'N\'hésitez pas à poser des questions à l\'IA pour clarifier vos doutes.'
    }
  ];

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guide d'utilisation</h1>
              <p className="text-gray-600">Apprenez à utiliser toutes les fonctionnalités de FrançaisFluide</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {sections.map((section) => (
                activeSection === section.id && (
                  <div key={section.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <section.icon className="w-6 h-6 text-blue-600" />
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    </div>

                    <div className="space-y-8">
                      {section.content.map((item, index) => (
                        <div key={index}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.title}</h3>
                          <div className="space-y-3">
                            {item.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-semibold text-blue-600">{stepIndex + 1}</span>
                                </div>
                                <p className="text-gray-700">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Conseils pratiques */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Conseils pratiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <tip.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                        <p className="text-gray-700 text-sm">{tip.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Besoin d'aide ?</h3>
              </div>
              <p className="text-green-700 mb-4">
                Si vous avez des questions ou rencontrez des difficultés, notre équipe de support est là pour vous aider.
              </p>
              <div className="flex gap-3">
                <a
                  href="/support"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contacter le support
                </a>
                <a
                  href="/support?tab=tutorials"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  Tutoriels vidéo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
