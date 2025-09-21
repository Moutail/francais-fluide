// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BookOpen,
  MessageSquare,
  FileText,
  Database,
  Server,
  Activity
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
  newUsersToday: number;
  activeUsersToday: number;
  averageSessionTime: number;
  conversionRate: number;
  grammarChecksToday: number;
  exercisesCompleted: number;
  supportTickets: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading, session, logout } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    activeUsersToday: 0,
    averageSessionTime: 0,
    conversionRate: 0,
    grammarChecksToday: 0,
    exercisesCompleted: 0,
    supportTickets: 0,
    systemHealth: 'healthy'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    // Simulation du chargement des données
    const loadStats = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 1247,
        activeSubscriptions: 892,
        monthlyRevenue: 26750.50,
        totalRevenue: 156789.25,
        newUsersToday: 23,
        activeUsersToday: 156,
        averageSessionTime: 18.5,
        conversionRate: 12.3,
        grammarChecksToday: 3421,
        exercisesCompleted: 892,
        supportTickets: 7,
        systemHealth: 'healthy'
      });
      setIsLoading(false);
    };

    loadStats();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tableau de bord Admin</h1>
                <p className="text-sm text-gray-600">FrançaisFluide - Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(stats.systemHealth)}`}>
                {getHealthIcon(stats.systemHealth)}
                Système {stats.systemHealth === 'healthy' ? 'Opérationnel' : 'Problème'}
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">+{stats.newUsersToday} aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs total</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">{stats.conversionRate}% conversion</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeSubscriptions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Abonnements actifs</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Ce mois</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenus mensuels</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeUsersToday}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenus */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenus totaux</span>
                <span className="font-semibold text-gray-900">${stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ce mois</span>
                <span className="font-semibold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm text-gray-500">Objectif mensuel: $35,000</p>
            </div>
          </div>

          {/* Activité */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Corrections aujourd'hui</span>
                <span className="font-semibold text-gray-900">{stats.grammarChecksToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exercices complétés</span>
                <span className="font-semibold text-gray-900">{stats.exercisesCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Temps de session moyen</span>
                <span className="font-semibold text-gray-900">{stats.averageSessionTime} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <a href="/admin/users" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <p className="text-sm text-gray-600">Voir et gérer les comptes</p>
              </div>
            </div>
          </a>

          <a href="/admin/subscriptions" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Abonnements</h3>
                <p className="text-sm text-gray-600">Gérer les paiements</p>
              </div>
            </div>
          </a>

          <a href="/admin/analytics" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Statistiques détaillées</p>
              </div>
            </div>
          </a>

          <a href="/admin/settings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Paramètres</h3>
                <p className="text-sm text-gray-600">Configuration du site</p>
              </div>
            </div>
          </a>
        </div>

        {/* Notifications et alertes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Tickets de support en attente</p>
                <p className="text-sm text-yellow-700">{stats.supportTickets} tickets nécessitent votre attention</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Maintenance programmée</p>
                <p className="text-sm text-blue-700">Mise à jour prévue dimanche à 2h00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Système opérationnel</p>
                <p className="text-sm text-green-700">Tous les services fonctionnent normalement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
