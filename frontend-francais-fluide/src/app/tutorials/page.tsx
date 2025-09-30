'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import {
  PlayCircle,
  Clock,
  User,
  Star,
  Filter,
  Search,
  Plus,
  Upload,
  Video,
  BookOpen,
  Target,
  Zap,
  Settings,
} from 'lucide-react';

export default function TutorialsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Rediriger les utilisateurs non connectés
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  const categories = [
    { id: 'all', label: 'Tous', icon: Video },
    { id: 'getting-started', label: 'Démarrage', icon: PlayCircle },
    { id: 'exercises', label: 'Exercices', icon: Target },
    { id: 'ai-features', label: 'Fonctionnalités IA', icon: Zap },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'advanced', label: 'Avancé', icon: BookOpen },
  ];

  const levels = [
    { id: 'all', label: 'Tous les niveaux' },
    { id: 'beginner', label: 'Débutant' },
    { id: 'intermediate', label: 'Intermédiaire' },
    { id: 'advanced', label: 'Avancé' },
  ];

  // Tutoriels simulés (à remplacer par de vrais tutoriels)
  const tutorials = [
    {
      id: 1,
      title: 'Bienvenue sur FrançaisFluide - Premiers pas',
      description: "Découvrez les bases de la plateforme et comment naviguer dans l'interface.",
      category: 'getting-started',
      level: 'beginner',
      duration: '5:30',
      thumbnail: '/images/tutorials/welcome.jpg',
      videoUrl: '#', // À remplacer par l'URL réelle
      author: 'Équipe FrançaisFluide',
      rating: 4.8,
      views: 1250,
      isNew: true,
    },
    {
      id: 2,
      title: 'Comment utiliser les exercices de grammaire',
      description: 'Apprenez à naviguer dans les exercices et à comprendre les corrections.',
      category: 'exercises',
      level: 'beginner',
      duration: '8:15',
      thumbnail: '/images/tutorials/grammar.jpg',
      videoUrl: '#',
      author: 'Marie Dubois',
      rating: 4.6,
      views: 890,
      isNew: false,
    },
    {
      id: 3,
      title: "Génération d'exercices personnalisés avec l'IA",
      description:
        "Découvrez comment créer des exercices adaptés à vos besoins avec l'intelligence artificielle.",
      category: 'ai-features',
      level: 'intermediate',
      duration: '12:45',
      thumbnail: '/images/tutorials/ai-exercises.jpg',
      videoUrl: '#',
      author: 'Jean Martin',
      rating: 4.9,
      views: 2100,
      isNew: true,
    },
    {
      id: 4,
      title: "Utilisation du chat IA pour l'apprentissage",
      description:
        "Comment interagir efficacement avec l'assistant IA pour maximiser votre apprentissage.",
      category: 'ai-features',
      level: 'intermediate',
      duration: '10:20',
      thumbnail: '/images/tutorials/ai-chat.jpg',
      videoUrl: '#',
      author: 'Sophie Laurent',
      rating: 4.7,
      views: 1650,
      isNew: false,
    },
    {
      id: 5,
      title: 'Configuration des paramètres et préférences',
      description: "Personnalisez votre expérience d'apprentissage selon vos besoins.",
      category: 'settings',
      level: 'beginner',
      duration: '6:30',
      thumbnail: '/images/tutorials/settings.jpg',
      videoUrl: '#',
      author: 'Équipe FrançaisFluide',
      rating: 4.5,
      views: 750,
      isNew: false,
    },
    {
      id: 6,
      title: 'Techniques avancées de dictée',
      description: 'Maîtrisez les dictées audio et améliorez votre compréhension orale.',
      category: 'exercises',
      level: 'advanced',
      duration: '15:00',
      thumbnail: '/images/tutorials/dictation.jpg',
      videoUrl: '#',
      author: 'Pierre Moreau',
      rating: 4.8,
      views: 3200,
      isNew: false,
    },
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || tutorial.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Video;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tutoriels vidéo</h1>
                <p className="text-gray-600">
                  Apprenez à maîtriser FrançaisFluide avec nos guides vidéo
                </p>
              </div>
            </div>

            {/* Bouton d'ajout de tutoriel (pour les administrateurs) */}
            <button className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Ajouter un tutoriel
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un tutoriel..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={e => setSelectedLevel(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des tutoriels */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutorials.map(tutorial => {
            const CategoryIcon = getCategoryIcon(tutorial.category);

            return (
              <div
                key={tutorial.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                    <PlayCircle className="h-16 w-16 text-purple-600" />
                  </div>

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {tutorial.isNew && (
                      <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                        Nouveau
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getLevelColor(tutorial.level)}`}
                    >
                      {tutorial.level === 'beginner'
                        ? 'Débutant'
                        : tutorial.level === 'intermediate'
                          ? 'Intermédiaire'
                          : 'Avancé'}
                    </span>
                  </div>

                  {/* Durée */}
                  <div className="absolute bottom-3 right-3 rounded bg-black bg-opacity-75 px-2 py-1 text-sm text-white">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {tutorial.duration}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      {categories.find(cat => cat.id === tutorial.category)?.label}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                    {tutorial.title}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{tutorial.description}</p>

                  {/* Métadonnées */}
                  <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{tutorial.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{tutorial.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{tutorial.views.toLocaleString()} vues</span>
                  </div>

                  {/* Bouton de lecture */}
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-white transition-colors hover:bg-purple-700">
                    <PlayCircle className="h-4 w-4" />
                    Regarder maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun tutoriel trouvé */}
        {filteredTutorials.length === 0 && (
          <div className="py-12 text-center">
            <Video className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucun tutoriel trouvé</h3>
            <p className="mb-4 text-gray-600">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
            >
              <Filter className="h-4 w-4" />
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Section d'ajout de tutoriel pour les administrateurs */}
        <div className="mt-12 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8">
          <div className="text-center">
            <Upload className="mx-auto mb-4 h-12 w-12 text-purple-600" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Ajouter un nouveau tutoriel
            </h3>
            <p className="mb-6 text-gray-600">
              Vous avez créé un tutoriel vidéo ? Ajoutez-le à notre bibliothèque pour aider d'autres
              utilisateurs.
            </p>
            <div className="flex justify-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700">
                <Upload className="h-4 w-4" />
                Télécharger une vidéo
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-6 py-3 text-purple-700 transition-colors hover:bg-purple-50">
                <Plus className="h-4 w-4" />
                Créer un tutoriel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
