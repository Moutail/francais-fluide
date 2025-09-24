'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useApi';
import { useSubscriptionSimple } from '@/hooks/useSubscriptionSimple';
import Navigation from '@/components/layout/Navigation';
import { DictationExercise } from '@/components/exercises/DictationExercise';
import {
  Play,
  Clock,
  Target,
  Award,
  Volume2,
  Headphones,
  BookOpen,
  Star,
  Filter,
  Search
} from 'lucide-react';

interface Dictation {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutes
  audioUrl: string;
  text: string;
  category: string;
  tags: string[];
  completed: boolean;
  score?: number;
  attempts: number;
}

export default function DictationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { getStatus, canUseFeature } = useSubscriptionSimple();
  
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [selectedDictation, setSelectedDictation] = useState<Dictation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les dictées
  useEffect(() => {
    if (isAuthenticated) {
      loadDictations();
    }
  }, [isAuthenticated]);

  const loadDictations = async () => {
    setIsLoading(true);
    try {
      // Simulation de chargement de données
      const mockDictations: Dictation[] = [
        {
          id: 'dict-1',
          title: 'La vie quotidienne',
          description: 'Une dictée sur les activités de la vie quotidienne',
          difficulty: 'beginner',
          duration: 5,
          audioUrl: '/audio/dictation-1.mp3',
          text: 'Chaque matin, je me lève à sept heures. Je prends ma douche et je m\'habille. Ensuite, je prends mon petit-déjeuner avec ma famille. Nous mangeons du pain, du beurre et de la confiture. Après le petit-déjeuner, je vais à l\'école en bus.',
          category: 'quotidien',
          tags: ['quotidien', 'famille', 'école'],
          completed: false,
          attempts: 0
        },
        {
          id: 'dict-2',
          title: 'Les saisons',
          description: 'Découvrez les quatre saisons en français',
          difficulty: 'intermediate',
          duration: 8,
          audioUrl: '/audio/dictation-2.mp3',
          text: 'Le printemps est une saison magnifique. Les arbres fleurissent et les oiseaux chantent. L\'été apporte la chaleur et les longues journées ensoleillées. L\'automne colore les feuilles en rouge et en orange. L\'hiver recouvre tout de neige blanche.',
          category: 'nature',
          tags: ['saisons', 'nature', 'couleurs'],
          completed: true,
          score: 85,
          attempts: 2
        },
        {
          id: 'dict-3',
          title: 'L\'histoire de France',
          description: 'Un texte sur l\'histoire de notre pays',
          difficulty: 'advanced',
          duration: 12,
          audioUrl: '/audio/dictation-3.mp3',
          text: 'La France a une histoire riche et complexe. Depuis l\'époque gallo-romaine jusqu\'à nos jours, elle a traversé de nombreuses périodes. La Révolution française de 1789 a marqué un tournant décisif. Napoléon Bonaparte a conquis une grande partie de l\'Europe. Aujourd\'hui, la France est une république démocratique.',
          category: 'histoire',
          tags: ['histoire', 'France', 'révolution'],
          completed: false,
          attempts: 0
        },
        {
          id: 'dict-4',
          title: 'La cuisine française',
          description: 'Les spécialités culinaires de France',
          difficulty: 'intermediate',
          duration: 10,
          audioUrl: '/audio/dictation-4.mp3',
          text: 'La cuisine française est réputée dans le monde entier. Le croissant et la baguette sont des symboles de notre gastronomie. Les fromages français sont nombreux et variés. Le vin accompagne souvent nos repas. La pâtisserie française est un art délicat.',
          category: 'culture',
          tags: ['cuisine', 'gastronomie', 'culture'],
          completed: true,
          score: 92,
          attempts: 1
        }
      ];

      setDictations(mockDictations);
    } catch (error) {
      console.error('Erreur lors du chargement des dictées:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDictation = (dictation: Dictation) => {
    setSelectedDictation(dictation);
  };

  const handleCompleteDictation = (score: number, timeSpent: number) => {
    if (selectedDictation) {
      // Mettre à jour les données de la dictée
      setDictations(prev => prev.map(d => 
        d.id === selectedDictation.id 
          ? { ...d, completed: true, score, attempts: d.attempts + 1 }
          : d
      ));
      
      // Retourner à la liste
      setSelectedDictation(null);
    }
  };

  const handleSkipDictation = () => {
    setSelectedDictation(null);
  };

  const filteredDictations = dictations.filter(dictation => {
    const matchesSearch = dictation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dictation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || dictation.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || dictation.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return difficulty;
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

  // Vérifier si l'utilisateur a accès aux dictées
  if (!canUseFeature('voiceAssistant')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dictées Audio</h1>
            <p className="text-gray-600 mb-6">
              Cette fonctionnalité est disponible avec un abonnement Étudiant ou supérieur.
            </p>
            <a
              href="/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Headphones className="w-5 h-5" />
              Voir les plans d'abonnement
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Si une dictée est sélectionnée, afficher le composant d'exercice
  if (selectedDictation) {
    return (
      <DictationExercise
        id={selectedDictation.id}
        title={selectedDictation.title}
        audioUrl={selectedDictation.audioUrl}
        text={selectedDictation.text}
        difficulty={selectedDictation.difficulty}
        timeLimit={selectedDictation.duration * 60}
        onComplete={handleCompleteDictation}
        onSkip={handleSkipDictation}
      />
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
              <Headphones className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dictées Audio</h1>
              <p className="text-gray-600">Améliorez votre compréhension orale et votre orthographe</p>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une dictée..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les difficultés</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="quotidien">Quotidien</option>
              <option value="nature">Nature</option>
              <option value="histoire">Histoire</option>
              <option value="culture">Culture</option>
            </select>
          </div>
        </div>

        {/* Liste des dictées */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des dictées...</p>
            </div>
          </div>
        ) : filteredDictations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDictations.map(dictation => (
              <div key={dictation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{dictation.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{dictation.description}</p>
                  </div>
                  {dictation.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">{dictation.score}%</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dictation.difficulty)}`}>
                    {getDifficultyLabel(dictation.difficulty)}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{dictation.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{dictation.attempts} tentatives</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {dictation.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleStartDictation(dictation)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {dictation.completed ? 'Refaire' : 'Commencer'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune dictée trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}

        {/* Statistiques */}
        {dictations.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vos statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dictations.filter(d => d.completed).length}
                </div>
                <div className="text-sm text-gray-600">Dictées terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dictations.filter(d => d.completed).length > 0 
                    ? Math.round(dictations.filter(d => d.completed).reduce((sum, d) => sum + (d.score || 0), 0) / dictations.filter(d => d.completed).length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Score moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dictations.reduce((sum, d) => sum + d.attempts, 0)}
                </div>
                <div className="text-sm text-gray-600">Tentatives totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dictations.reduce((sum, d) => sum + d.duration, 0)} min
                </div>
                <div className="text-sm text-gray-600">Temps total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
