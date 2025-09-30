'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  TrendingUp,
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
          Authorization: `Bearer ${token}`,
        },
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
    setMissions(prev =>
      prev.map(mission =>
        mission.id === missionId ? { ...mission, status: 'in_progress' as const } : mission
      )
    );
  };

  const handleCompleteMission = (missionId: string) => {
    setMissions(prev =>
      prev.map(mission =>
        mission.id === missionId
          ? { ...mission, status: 'completed' as const, progress: mission.requirement }
          : mission
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return '📅';
      case 'weekly':
        return '📆';
      case 'monthly':
        return '🗓️';
      case 'special':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'writing':
        return '✍️';
      case 'exercises':
        return '📚';
      case 'accuracy':
        return '🎯';
      case 'streak':
        return '🔥';
      case 'social':
        return '👥';
      default:
        return '🎯';
    }
  };

  const filteredMissions = missions.filter(mission => {
    const matchesSearch =
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || mission.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || mission.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeMissions = missions.filter(m => m.status === 'in_progress').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const totalPoints = missions
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.points, 0);

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
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
              <p className="text-gray-600">Relevez des défis et gagnez des récompenses</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions actives</p>
                  <p className="text-3xl font-bold text-gray-900">{activeMissions}</p>
                </div>
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missions terminées</p>
                  <p className="text-3xl font-bold text-gray-900">{completedMissions}</p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Points gagnés</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une mission..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="daily">Quotidiennes</option>
              <option value="weekly">Hebdomadaires</option>
              <option value="monthly">Mensuelles</option>
              <option value="special">Spéciales</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Chargement des missions...</p>
            </div>
          </div>
        ) : filteredMissions.length > 0 ? (
          <div className="space-y-6">
            {filteredMissions.map(mission => (
              <div
                key={mission.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getTypeIcon(mission.type)}</div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(mission.status)}`}
                        >
                          {mission.status === 'available'
                            ? 'Disponible'
                            : mission.status === 'in_progress'
                              ? 'En cours'
                              : mission.status === 'completed'
                                ? 'Terminée'
                                : 'Expirée'}
                        </span>
                      </div>
                      <p className="mb-3 text-gray-600">{mission.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>{getCategoryIcon(mission.category)}</span>
                          <span>{mission.category}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}
                        >
                          {mission.difficulty === 'easy'
                            ? 'Facile'
                            : mission.difficulty === 'medium'
                              ? 'Moyen'
                              : 'Difficile'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{mission.points} pts</span>
                        </div>
                        {mission.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Échéance: {new Date(mission.deadline).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Progression</span>
                    <span>
                      {mission.progress}/{mission.requirement}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        mission.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((mission.progress / mission.requirement) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Récompenses */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Récompenses:</span>
                      <span className="ml-2">+{mission.rewards.xp} XP</span>
                      {mission.rewards.coins && (
                        <span className="ml-2">+{mission.rewards.coins} pièces</span>
                      )}
                      {mission.rewards.badge && (
                        <span className="ml-2">🏆 {mission.rewards.badge}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mission.status === 'available' && (
                      <button
                        onClick={() => handleStartMission(mission.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                      >
                        Commencer
                      </button>
                    )}
                    {mission.status === 'in_progress' &&
                      mission.progress >= mission.requirement && (
                        <button
                          onClick={() => handleCompleteMission(mission.id)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                        >
                          Terminer
                        </button>
                      )}
                    {mission.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Terminée</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Target className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucune mission trouvée</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
