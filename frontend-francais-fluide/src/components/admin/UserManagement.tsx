'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Crown,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
    endDate: string;
  };
  progress?: {
    level: number;
    xp: number;
    exercisesCompleted: number;
    lastActivity?: string;
  };
  _count?: {
    supportTickets: number;
    exercises: number;
  };
}

interface UserManagementProps {
  onNavigate: (section: string, data?: any) => void;
}

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filtres et recherche
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Modal de confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, roleFilter, statusFilter, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await apiClient.makeRequest(`/api/admin/users?${params}`);

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
        setTotalUsers(response.data.pagination.total);
      } else {
        setError(response.error || 'Erreur de chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await apiClient.makeRequest(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setUsers(users.filter(u => u.id !== user.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        alert(response.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion');
      console.error('Erreur suppression utilisateur:', err);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await apiClient.makeRequest(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      if (response.success) {
        setUsers(users.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
      } else {
        alert(response.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      alert('Erreur de connexion');
      console.error('Erreur modification statut:', err);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      user: 'Utilisateur',
      admin: 'Administrateur',
      super_admin: 'Super Admin',
      tester: 'Testeur',
      teacher: 'Professeur',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      user: 'bg-gray-100 text-gray-800',
      admin: 'bg-red-100 text-red-800',
      super_admin: 'bg-purple-100 text-purple-800',
      tester: 'bg-yellow-100 text-yellow-800',
      teacher: 'bg-blue-100 text-blue-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="mt-2 text-gray-600">
            {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button onClick={() => onNavigate('users-create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="teacher">Professeur</option>
            <option value="tester">Testeur</option>
            <option value="admin">Administrateur</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Plus récents</option>
            <option value="createdAt-asc">Plus anciens</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="lastLogin-desc">Dernière connexion</option>
          </select>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Actions en lot */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné
              {selectedUsers.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                Modifier le rôle
              </Button>
              <Button size="sm" variant="secondary">
                Exporter
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedUsers([])}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table des utilisateurs */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Abonnement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {user.subscription ? (
                      <div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSubscriptionColor(user.subscription.status)}`}
                        >
                          {user.subscription.plan}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          Expire le{' '}
                          {new Date(user.subscription.endDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Aucun abonnement</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {user.progress ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Niveau {user.progress.level} ({user.progress.xp} XP)
                        </div>
                        <div className="text-gray-500">
                          {user.progress.exercisesCompleted} exercices
                        </div>
                        {user.progress.lastActivity && (
                          <div className="text-xs text-gray-400">
                            Dernière activité:{' '}
                            {new Date(user.progress.lastActivity).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Pas de progression</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.isActive ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-800">Actif</span>
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-800">Inactif</span>
                        </>
                      )}
                    </div>
                    {user.lastLogin && (
                      <div className="mt-1 text-xs text-gray-400">
                        Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('users-edit', user)}
                        className="p-2"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleUserStatus(user)}
                        className="p-2"
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('subscriptions-edit', user)}
                        className="p-2"
                        title="Gérer l'abonnement"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t bg-gray-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} ({totalUsers} utilisateurs au total)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="mx-4 max-w-md p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
            </div>

            <p className="mb-6 text-gray-600">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete.name}</strong>{' '}
              ? Cette action est irréversible et supprimera toutes ses données.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteUser(userToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
