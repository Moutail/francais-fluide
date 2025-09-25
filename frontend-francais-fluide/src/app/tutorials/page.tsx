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
  Settings
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
    { id: 'advanced', label: 'Avancé', icon: BookOpen }
  ];

  const levels = [
    { id: 'all', label: 'Tous les niveaux' },
    { id: 'beginner', label: 'Débutant' },
    { id: 'intermediate', label: 'Intermédiaire' },
    { id: 'advanced', label: 'Avancé' }
  ];

  // Tutoriels simulés (à remplacer par de vrais tutoriels)
  const tutorials = [
    {
      id: 1,
      title: 'Bienvenue sur FrançaisFluide - Premiers pas',
      description: 'Découvrez les bases de la plateforme et comment naviguer dans l\'interface.',
      category: 'getting-started',
      level: 'beginner',
      duration: '5:30',
      thumbnail: '/images/tutorials/welcome.jpg',
      videoUrl: '#', // À remplacer par l'URL réelle
      author: 'Équipe FrançaisFluide',
      rating: 4.8,
      views: 1250,
      isNew: true
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
      isNew: false
    },
    {
      id: 3,
      title: 'Génération d\'exercices personnalisés avec l\'IA',
      description: 'Découvrez comment créer des exercices adaptés à vos besoins avec l\'intelligence artificielle.',
      category: 'ai-features',
      level: 'intermediate',
      duration: '12:45',
      thumbnail: '/images/tutorials/ai-exercises.jpg',
      videoUrl: '#',
      author: 'Jean Martin',
      rating: 4.9,
      views: 2100,
      isNew: true
    },
    {
      id: 4,
      title: 'Utilisation du chat IA pour l\'apprentissage',
      description: 'Comment interagir efficacement avec l\'assistant IA pour maximiser votre apprentissage.',
      category: 'ai-features',
      level: 'intermediate',
      duration: '10:20',
      thumbnail: '/images/tutorials/ai-chat.jpg',
      videoUrl: '#',
      author: 'Sophie Laurent',
      rating: 4.7,
      views: 1650,
      isNew: false
    },
    {
      id: 5,
      title: 'Configuration des paramètres et préférences',
      description: 'Personnalisez votre expérience d\'apprentissage selon vos besoins.',
      category: 'settings',
      level: 'beginner',
      duration: '6:30',
      thumbnail: '/images/tutorials/settings.jpg',
      videoUrl: '#',
      author: 'Équipe FrançaisFluide',
      rating: 4.5,
      views: 750,
      isNew: false
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
      isNew: false
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tutoriels vidéo</h1>
                <p className="text-gray-600">Apprenez à maîtriser FrançaisFluide avec nos guides vidéo</p>
              </div>
            </div>
            
            {/* Bouton d'ajout de tutoriel (pour les administrateurs) */}
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4" />
              Ajouter un tutoriel
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un tutoriel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des tutoriels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => {
            const CategoryIcon = getCategoryIcon(tutorial.category);
            
            return (
              <div key={tutorial.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-purple-600" />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {tutorial.isNew && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        Nouveau
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(tutorial.level)}`}>
                      {tutorial.level === 'beginner' ? 'Débutant' : 
                       tutorial.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </span>
                  </div>

                  {/* Durée */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {tutorial.duration}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      {categories.find(cat => cat.id === tutorial.category)?.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tutorial.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{tutorial.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{tutorial.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{tutorial.views.toLocaleString()} vues</span>
                  </div>

                  {/* Bouton de lecture */}
                  <button className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <PlayCircle className="w-4 h-4" />
                    Regarder maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun tutoriel trouvé */}
        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun tutoriel trouvé</h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Section d'ajout de tutoriel pour les administrateurs */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
          <div className="text-center">
            <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ajouter un nouveau tutoriel</h3>
            <p className="text-gray-600 mb-6">
              Vous avez créé un tutoriel vidéo ? Ajoutez-le à notre bibliothèque pour aider d'autres utilisateurs.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Upload className="w-4 h-4" />
                Télécharger une vidéo
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors">
                <Plus className="w-4 h-4" />
                Créer un tutoriel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
