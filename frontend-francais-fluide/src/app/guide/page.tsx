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
  Award,
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
            "Choisissez votre plan d'abonnement",
            'Complétez votre profil utilisateur',
            'Explorez le tableau de bord principal',
          ],
        },
        {
          title: 'Configuration initiale',
          steps: [
            'Définissez votre niveau de français',
            "Sélectionnez vos objectifs d'apprentissage",
            'Configurez vos préférences de notification',
            "Explorez les différents types d'exercices",
          ],
        },
      ],
    },
    {
      id: 'exercises',
      title: 'Exercices et pratique',
      icon: Target,
      content: [
        {
          title: "Types d'exercices disponibles",
          steps: [
            'Exercices de grammaire adaptatifs',
            'Dictées audio avec correction automatique',
            'Exercices de vocabulaire contextuel',
            "Génération d'exercices personnalisés par IA",
          ],
        },
        {
          title: 'Comment utiliser les exercices',
          steps: [
            'Sélectionnez un exercice depuis la page Exercices',
            'Lisez attentivement les instructions',
            'Répondez aux questions dans le temps imparti',
            'Consultez vos résultats et corrections détaillées',
          ],
        },
      ],
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
            "L'IA s'adapte à votre niveau et vos erreurs",
          ],
        },
        {
          title: "Génération d'exercices personnalisés",
          steps: [
            "Accédez au générateur d'exercices IA",
            'Sélectionnez vos domaines de focus',
            'Choisissez le niveau de difficulté',
            'Générez des exercices adaptés à vos besoins',
          ],
        },
      ],
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
            "Visualisez votre temps d'étude",
            'Débloquez des succès et objectifs',
          ],
        },
        {
          title: 'Analytics et recommandations',
          steps: [
            'Analysez vos erreurs récurrentes',
            'Recevez des recommandations personnalisées',
            'Identifiez vos points forts et faiblesses',
            "Adaptez votre plan d'apprentissage",
          ],
        },
      ],
    },
    {
      id: 'editor',
      title: 'Éditeur intelligent',
      icon: FileText,
      content: [
        {
          title: "Fonctionnalités de l'éditeur",
          steps: [
            'Écrivez vos textes avec assistance IA',
            'Correction grammaticale en temps réel',
            'Suggestions de vocabulaire et style',
            'Analyse de la complexité de vos textes',
          ],
        },
        {
          title: "Comment utiliser l'éditeur",
          steps: [
            "Accédez à l'éditeur depuis le menu principal",
            'Commencez à taper votre texte',
            'Consultez les suggestions en temps réel',
            'Sauvegardez vos documents pour référence future',
          ],
        },
      ],
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
            'Exportez vos données si nécessaire',
          ],
        },
        {
          title: "Gestion de l'abonnement",
          steps: [
            'Consultez votre plan actuel',
            'Modifiez votre abonnement',
            'Gérez vos informations de facturation',
            'Annulez votre abonnement si nécessaire',
          ],
        },
      ],
    },
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: 'Conseil pratique',
      content: 'Pratiquez régulièrement, même 10 minutes par jour, pour de meilleurs résultats.',
    },
    {
      icon: Target,
      title: 'Objectif SMART',
      content: 'Définissez des objectifs spécifiques et mesurables pour votre apprentissage.',
    },
    {
      icon: BarChart3,
      title: 'Suivi des progrès',
      content:
        "Consultez régulièrement vos statistiques pour identifier vos points d'amélioration.",
    },
    {
      icon: MessageSquare,
      title: "Utilisez l'IA",
      content: "N'hésitez pas à poser des questions à l'IA pour clarifier vos doutes.",
    },
  ];

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guide d'utilisation</h1>
              <p className="text-gray-600">
                Apprenez à utiliser toutes les fonctionnalités de FrançaisFluide
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Sections</h3>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      activeSection === section.id
                        ? 'border border-blue-200 bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              {sections.map(
                section =>
                  activeSection === section.id && (
                    <div key={section.id}>
                      <div className="mb-6 flex items-center gap-3">
                        <section.icon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                      </div>

                      <div className="space-y-8">
                        {section.content.map((item, index) => (
                          <div key={index}>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            <div className="space-y-3">
                              {item.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-xs font-semibold text-blue-600">
                                      {stepIndex + 1}
                                    </span>
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
              )}
            </div>

            {/* Conseils pratiques */}
            <div className="mt-8">
              <h3 className="mb-6 text-xl font-bold text-gray-900">Conseils pratiques</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <tip.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">{tip.title}</h4>
                        <p className="text-sm text-gray-700">{tip.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="mt-8 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Besoin d'aide ?</h3>
              </div>
              <p className="mb-4 text-green-700">
                Si vous avez des questions ou rencontrez des difficultés, notre équipe de support
                est là pour vous aider.
              </p>
              <div className="flex gap-3">
                <a
                  href="/support"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter le support
                </a>
                <a
                  href="/support?tab=tutorials"
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-green-700 transition-colors hover:bg-green-50"
                >
                  <PlayCircle className="h-4 w-4" />
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
