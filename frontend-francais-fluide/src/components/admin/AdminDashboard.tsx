'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import {
  Users,
  UserCheck,
  CreditCard,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Calendar,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalExercises: number;
    totalDictations: number;
    openSupportTickets: number;
  };
  trends: {
    newUsersLast30Days: number;
    newSubscriptionsLast30Days: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    subscription?: {
      plan: string;
      status: string;
    };
  }>;
}

interface AdminDashboardProps {
  onNavigate: (section: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.makeRequest('/api/admin/dashboard');

      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || 'Erreur de chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-20 rounded bg-gray-200"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Erreur de chargement</h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <Button onClick={loadDashboardStats}>Réessayer</Button>
      </Card>
    );
  }

  if (!stats) return null;

  const quickActions = [
    {
      title: 'Créer un utilisateur',
      description: 'Ajouter un nouvel utilisateur ou testeur',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => onNavigate('users-create'),
    },
    {
      title: 'Gérer les abonnements',
      description: "Modifier les plans d'abonnement",
      icon: CreditCard,
      color: 'bg-green-500',
      action: () => onNavigate('subscriptions'),
    },
    {
      title: 'Ajouter une dictée',
      description: 'Créer une nouvelle dictée',
      icon: BookOpen,
      color: 'bg-purple-500',
      action: () => onNavigate('dictations-create'),
    },
    {
      title: 'Support urgent',
      description: 'Tickets en attente de réponse',
      icon: MessageCircle,
      color: 'bg-red-500',
      action: () => onNavigate('support'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="mt-2 text-gray-600">Vue d'ensemble de votre plateforme FrançaisFluide</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
              <p className="mt-1 text-sm text-green-600">
                +{stats.trends.newUsersLast30Days} ce mois
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.activeUsers}</p>
              <p className="mt-1 text-sm text-gray-500">
                {Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)}% du
                total
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abonnements actifs</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.activeSubscriptions}
              </p>
              <p className="mt-1 text-sm text-green-600">
                +{stats.trends.newSubscriptionsLast30Days} ce mois
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Support en attente</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.openSupportTickets}
              </p>
              <p className="mt-1 text-sm text-orange-600">Tickets ouverts</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <MessageCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Statistiques de contenu */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Exercices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalExercises}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Dictées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalDictations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-teal-100 p-3">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((stats.overview.activeSubscriptions / stats.overview.totalUsers) * 100)}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group rounded-lg border border-gray-200 p-4 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className={`p-2 ${action.color} rounded-lg`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Utilisateurs récents */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Utilisateurs récents</h2>
          <Button onClick={() => onNavigate('users')} variant="secondary" size="sm">
            Voir tous
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-900">Utilisateur</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Rôle</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Abonnement</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'teacher'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'tester'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'admin'
                        ? 'Admin'
                        : user.role === 'teacher'
                          ? 'Professeur'
                          : user.role === 'tester'
                            ? 'Testeur'
                            : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.subscription ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          user.subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Aucun</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
