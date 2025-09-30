'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Star, 
  GraduationCap, 
  Building, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  progress: {
    level: number;
    xp: number;
    exercisesCompleted: number;
    wordsWritten: number;
  };
}

interface SubscriptionStats {
  total: number;
  byPlan: {
    demo: number;
    etudiant: number;
    premium: number;
    etablissement: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
  };
  active: number;
  expired: number;
}

const PLAN_COLORS = {
  demo: 'bg-gray-100 text-gray-800',
  etudiant: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  etablissement: 'bg-orange-100 text-orange-800'
};

const PLAN_ICONS = {
  demo: Users,
  etudiant: GraduationCap,
  premium: Star,
  etablissement: Building
};

const PLAN_NAMES = {
  demo: 'Démo Gratuite',
  etudiant: 'Étudiant',
  premium: 'Premium',
  etablissement: 'Établissement'
};

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.subscription.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.subscription.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'expired': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Abonnements
          </h1>
          <p className="text-gray-600">
            Gérez les comptes utilisateurs et leurs niveaux d'abonnement
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="size-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="size-8 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.revenue.monthly}</p>
                </div>
                <DollarSign className="size-8 text-purple-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((stats.active / stats.total) * 100)}%
                  </p>
                </div>
                <TrendingUp className="size-8 text-orange-600" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Répartition par plan */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par Plan d'Abonnement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(stats.byPlan).map(([plan, count]) => {
                const Icon = PLAN_ICONS[plan as keyof typeof PLAN_ICONS];
                const percentage = Math.round((count / stats.total) * 100);
                
                return (
                  <div key={plan} className="text-center">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-2",
                      PLAN_COLORS[plan as keyof typeof PLAN_COLORS]
                    )}>
                      <Icon className="size-5" />
                      <span className="font-medium">{PLAN_NAMES[plan as keyof typeof PLAN_NAMES]}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les plans</option>
                <option value="demo">Démo</option>
                <option value="etudiant">Étudiant</option>
                <option value="premium">Premium</option>
                <option value="etablissement">Établissement</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tableau des utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => {
                  const StatusIcon = getStatusIcon(user.subscription.status);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 size-10">
                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                          PLAN_COLORS[user.subscription.plan as keyof typeof PLAN_COLORS]
                        )}>
                          {React.createElement(PLAN_ICONS[user.subscription.plan as keyof typeof PLAN_ICONS], { className: "size-4" })}
                          {PLAN_NAMES[user.subscription.plan as keyof typeof PLAN_NAMES]}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                          getStatusColor(user.subscription.status)
                        )}>
                          <StatusIcon className="size-4" />
                          {user.subscription.status}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Niveau {user.progress.level}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.progress.exercisesCompleted} exercices
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="size-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal de détails utilisateur */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Détails de l'utilisateur
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="size-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informations personnelles</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Nom:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Date d'inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Abonnement</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Plan:</strong> {PLAN_NAMES[selectedUser.subscription.plan as keyof typeof PLAN_NAMES]}</p>
                    <p><strong>Statut:</strong> {selectedUser.subscription.status}</p>
                    <p><strong>Début:</strong> {new Date(selectedUser.subscription.startDate).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Fin:</strong> {new Date(selectedUser.subscription.endDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Progression</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Niveau:</strong> {selectedUser.progress.level}</p>
                    <p><strong>XP:</strong> {selectedUser.progress.xp}</p>
                    <p><strong>Exercices complétés:</strong> {selectedUser.progress.exercisesCompleted}</p>
                    <p><strong>Mots écrits:</strong> {selectedUser.progress.wordsWritten}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}