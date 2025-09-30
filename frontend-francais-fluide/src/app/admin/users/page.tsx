// src/app/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Calendar,
  CreditCard,
  ArrowLeft,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'student' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActivity: string;
  totalSpent: number;
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  grammarChecks: number;
  exercisesCompleted: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des données
    const loadUsers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          plan: 'premium',
          status: 'active',
          joinDate: '2024-01-15',
          lastActivity: '2024-01-20',
          totalSpent: 89.97,
          subscriptionStatus: 'active',
          grammarChecks: 1247,
          exercisesCompleted: 89,
        },
        {
          id: '2',
          name: 'Marie Martin',
          email: 'marie.martin@email.com',
          plan: 'student',
          status: 'active',
          joinDate: '2024-01-10',
          lastActivity: '2024-01-19',
          totalSpent: 44.97,
          subscriptionStatus: 'active',
          grammarChecks: 892,
          exercisesCompleted: 67,
        },
        {
          id: '3',
          name: 'Pierre Dubois',
          email: 'pierre.dubois@email.com',
          plan: 'free',
          status: 'active',
          joinDate: '2024-01-05',
          lastActivity: '2024-01-18',
          totalSpent: 0,
          subscriptionStatus: 'expired',
          grammarChecks: 234,
          exercisesCompleted: 12,
        },
        {
          id: '4',
          name: 'Sophie Tremblay',
          email: 'sophie.tremblay@email.com',
          plan: 'enterprise',
          status: 'active',
          joinDate: '2024-01-12',
          lastActivity: '2024-01-20',
          totalSpent: 449.97,
          subscriptionStatus: 'active',
          grammarChecks: 2156,
          exercisesCompleted: 156,
        },
        {
          id: '5',
          name: 'Alexandre Roy',
          email: 'alexandre.roy@email.com',
          plan: 'premium',
          status: 'suspended',
          joinDate: '2024-01-08',
          lastActivity: '2024-01-15',
          totalSpent: 59.97,
          subscriptionStatus: 'cancelled',
          grammarChecks: 567,
          exercisesCompleted: 34,
        },
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par plan
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.plan === filterPlan);
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterPlan, filterStatus]);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(user => user.id)
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Action ${action} sur ${selectedUsers.length} utilisateurs`);
    // Implémenter les actions en lot
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <Users className="size-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                  <p className="text-sm text-gray-600">
                    {filteredUsers.length} utilisateurs trouvés
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                <Download className="size-4" />
                Exporter
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Plus className="size-4" />
                Nouvel utilisateur
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtres et recherche */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les plans</option>
              <option value="free">Gratuit</option>
              <option value="student">Étudiant</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Établissement</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>

            <button className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
              <Filter className="size-4" />
              Plus de filtres
            </button>
          </div>
        </div>

        {/* Actions en lot */}
        {selectedUsers.length > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-blue-800">
                {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné
                {selectedUsers.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  Activer
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des utilisateurs */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dernière activité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPlanColor(user.plan)}`}
                      >
                        {user.plan === 'free'
                          ? 'Gratuit'
                          : user.plan === 'student'
                            ? 'Étudiant'
                            : user.plan === 'premium'
                              ? 'Premium'
                              : 'Établissement'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(user.status)}`}
                      >
                        {user.status === 'active'
                          ? 'Actif'
                          : user.status === 'inactive'
                            ? 'Inactif'
                            : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{user.grammarChecks} corrections</div>
                        <div className="text-gray-500">{user.exercisesCompleted} exercices</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.lastActivity).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Voir">
                          <Eye className="size-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Modifier">
                          <Edit className="size-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Plus">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de 1 à {filteredUsers.length} sur {users.length} utilisateurs
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
              Précédent
            </button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">1</button>
            <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
