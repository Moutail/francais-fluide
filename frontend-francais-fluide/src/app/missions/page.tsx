'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useApi';
import Navigation from '@/components/layout/Navigation';
import {
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Filter,
  Search,
  Award,
  TrendingUp
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  progress: number;
  requirement: number;
  deadline?: string;
  rewards: {
    xp: number;
    coins?: number;
    badge?: string;
  };
  category: 'writing' | 'exercises' | 'accuracy' | 'streak' | 'social';
}

export default function MissionsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les missions
  useEffect(() => {
    if (isAuthenticated) {
      loadMissions();
    }
  }, [isAuthenticated]);

  const loadMissions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/missions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMissions(data.data);
      } else {
        console.error('Erreur chargement missions:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMission = (missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, status: 'in_progress' as const }
        : mission
    ));
  };

  const handleCompleteMission = (missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, status: 'completed' as const, progress: mission.requirement }
        : mission
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'special': return '⭐';
      default: return '🎯';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'writing': return '✍️';
      case 'exercises': return '📚';
      case 'accuracy': return '🎯';
      case 'streak': return '🔥';
      case 'social': return '👥';
      default: return '🎯';
    }
  };

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || mission.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || mission.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeMissions = missions.filter(m => m.status === 'in_progress').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const totalPoints = missions.filter(m => m.status === 'completed').reduce((sum, m) => sum + m.points, 0);

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
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
              <p className="text-gray-600">Relevez des défis et gagnez des récompenses</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions actives</p>
                  <p className="text-3xl font-bold text-gray-900">{activeMissions}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions terminées</p>
                  <p className="text-3xl font-bold text-gray-900">{completedMissions}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points gagnés</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="daily">Quotidiennes</option>
              <option value="weekly">Hebdomadaires</option>
              <option value="monthly">Mensuelles</option>
              <option value="special">Spéciales</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponibles</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>

        {/* Liste des missions */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des missions...</p>
            </div>
          </div>
        ) : filteredMissions.length > 0 ? (
          <div className="space-y-6">
            {filteredMissions.map(mission => (
              <div
                key={mission.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getTypeIcon(mission.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                          {mission.status === 'available' ? 'Disponible' :
                           mission.status === 'in_progress' ? 'En cours' :
                           mission.status === 'completed' ? 'Terminée' : 'Expirée'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{mission.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>{getCategoryIcon(mission.category)}</span>
                          <span>{mission.category}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty === 'easy' ? 'Facile' :
                           mission.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{mission.points} pts</span>
                        </div>
                        {mission.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Échéance: {new Date(mission.deadline).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{mission.progress}/{mission.requirement}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        mission.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((mission.progress / mission.requirement) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Récompenses */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Récompenses:</span>
                      <span className="ml-2">+{mission.rewards.xp} XP</span>
                      {mission.rewards.coins && <span className="ml-2">+{mission.rewards.coins} pièces</span>}
                      {mission.rewards.badge && <span className="ml-2">🏆 {mission.rewards.badge}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mission.status === 'available' && (
                      <button
                        onClick={() => handleStartMission(mission.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Commencer
                      </button>
                    )}
                    {mission.status === 'in_progress' && mission.progress >= mission.requirement && (
                      <button
                        onClick={() => handleCompleteMission(mission.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Terminer
                      </button>
                    )}
                    {mission.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Terminée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}

