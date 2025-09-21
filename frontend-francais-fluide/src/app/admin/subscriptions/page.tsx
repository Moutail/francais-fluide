// src/app/admin/subscriptions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'student' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  lastPaymentDate: string;
  nextPaymentDate: string;
  totalPayments: number;
  totalRevenue: number;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des données
    const loadSubscriptions = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          userId: 'user_1',
          userName: 'Jean Dupont',
          userEmail: 'jean.dupont@email.com',
          plan: 'premium',
          status: 'active',
          amount: 29.99,
          currency: 'CAD',
          billingInterval: 'month',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          createdAt: '2024-01-01',
          lastPaymentDate: '2024-01-01',
          nextPaymentDate: '2024-02-01',
          totalPayments: 3,
          totalRevenue: 89.97
        },
        {
          id: 'sub_2',
          userId: 'user_2',
          userName: 'Marie Martin',
          userEmail: 'marie.martin@email.com',
          plan: 'student',
          status: 'active',
          amount: 14.99,
          currency: 'CAD',
          billingInterval: 'month',
          currentPeriodStart: '2024-01-10',
          currentPeriodEnd: '2024-02-10',
          cancelAtPeriodEnd: false,
          createdAt: '2024-01-10',
          lastPaymentDate: '2024-01-10',
          nextPaymentDate: '2024-02-10',
          totalPayments: 2,
          totalRevenue: 29.98
        },
        {
          id: 'sub_3',
          userId: 'user_4',
          userName: 'Sophie Tremblay',
          userEmail: 'sophie.tremblay@email.com',
          plan: 'enterprise',
          status: 'active',
          amount: 149.99,
          currency: 'CAD',
          billingInterval: 'month',
          currentPeriodStart: '2024-01-12',
          currentPeriodEnd: '2024-02-12',
          cancelAtPeriodEnd: false,
          createdAt: '2024-01-12',
          lastPaymentDate: '2024-01-12',
          nextPaymentDate: '2024-02-12',
          totalPayments: 1,
          totalRevenue: 149.99
        },
        {
          id: 'sub_4',
          userId: 'user_5',
          userName: 'Alexandre Roy',
          userEmail: 'alexandre.roy@email.com',
          plan: 'premium',
          status: 'cancelled',
          amount: 29.99,
          currency: 'CAD',
          billingInterval: 'month',
          currentPeriodStart: '2024-01-08',
          currentPeriodEnd: '2024-02-08',
          cancelAtPeriodEnd: true,
          createdAt: '2024-01-08',
          lastPaymentDate: '2024-01-08',
          nextPaymentDate: '2024-02-08',
          totalPayments: 2,
          totalRevenue: 59.98
        },
        {
          id: 'sub_5',
          userId: 'user_6',
          userName: 'Isabelle Gagnon',
          userEmail: 'isabelle.gagnon@email.com',
          plan: 'student',
          status: 'past_due',
          amount: 14.99,
          currency: 'CAD',
          billingInterval: 'month',
          currentPeriodStart: '2024-01-05',
          currentPeriodEnd: '2024-02-05',
          cancelAtPeriodEnd: false,
          createdAt: '2024-01-05',
          lastPaymentDate: '2024-01-05',
          nextPaymentDate: '2024-02-05',
          totalPayments: 1,
          totalRevenue: 14.99
        }
      ];
      
      setSubscriptions(mockSubscriptions);
      setFilteredSubscriptions(mockSubscriptions);
      setIsLoading(false);
    };

    loadSubscriptions();
  }, []);

  useEffect(() => {
    let filtered = subscriptions;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par plan
    if (filterPlan !== 'all') {
      filtered = filtered.filter(sub => sub.plan === filterPlan);
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus);
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, filterPlan, filterStatus]);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'past_due': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.totalRevenue, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length;
  const pastDueSubscriptions = subscriptions.filter(sub => sub.status === 'past_due').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des abonnements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestion des abonnements</h1>
                  <p className="text-sm text-gray-600">{filteredSubscriptions.length} abonnements trouvés</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenus totaux</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Actifs</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {activeSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Abonnements actifs</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm text-gray-500">Annulés</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {cancelledSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Abonnements annulés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">En retard</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {pastDueSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Paiements en retard</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les plans</option>
              <option value="student">Étudiant</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Établissement</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
              <option value="past_due">En retard</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4" />
              Plus de filtres
            </button>
          </div>
        </div>

        {/* Tableau des abonnements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnement
                  </th>
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
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prochain paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Créé le {new Date(subscription.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan)}`}>
                        {subscription.plan === 'student' ? 'Étudiant' :
                         subscription.plan === 'premium' ? 'Premium' : 'Établissement'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status === 'active' ? 'Actif' :
                           subscription.status === 'cancelled' ? 'Annulé' :
                           subscription.status === 'expired' ? 'Expiré' : 'En retard'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${subscription.amount.toFixed(2)} {subscription.currency}
                      <div className="text-xs text-gray-500">
                        /{subscription.billingInterval === 'month' ? 'mois' : 'an'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{new Date(subscription.currentPeriodStart).toLocaleDateString('fr-FR')}</div>
                      <div>au {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {subscription.cancelAtPeriodEnd ? (
                        <span className="text-yellow-600">Annulation à la fin</span>
                      ) : (
                        new Date(subscription.nextPaymentDate).toLocaleDateString('fr-FR')
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${subscription.totalRevenue.toFixed(2)}
                      <div className="text-xs text-gray-500">
                        {subscription.totalPayments} paiement{subscription.totalPayments > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Plus">
                          <MoreVertical className="w-4 h-4" />
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
            Affichage de 1 à {filteredSubscriptions.length} sur {subscriptions.length} abonnements
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              Précédent
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
