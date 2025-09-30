'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageCircle,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
} from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CreateUserForm from '@/components/admin/CreateUserForm';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminSubscriptions from '@/components/admin/AdminSubscriptions';
import AdminSupport from '@/components/admin/AdminSupport';
import AdminDictations from '@/components/admin/AdminDictations';
import AdminSettings from '@/components/admin/AdminSettings';

export default function AdminPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sectionData, setSectionData] = useState<unknown>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Vérifier les permissions admin
      checkAdminPermissions();
    } else if (!loading && !isAuthenticated) {
      // Rediriger vers la connexion principale si pas authentifié
      window.location.href = '/auth/login';
    }
  }, [user, loading, isAuthenticated]);

  const checkAdminPermissions = async () => {
    try {
      // Essayer d'accéder au dashboard admin pour vérifier les permissions
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setHasAdminAccess(true);
      } else {
        setHasAdminAccess(false);
      }
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      setHasAdminAccess(false);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: "Vue d'ensemble et statistiques",
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes utilisateurs',
    },
    {
      id: 'subscriptions',
      label: 'Abonnements',
      icon: CreditCard,
      description: 'Gestion des plans et facturations',
    },
    {
      id: 'support',
      label: 'Support',
      icon: MessageCircle,
      description: 'Messages et tickets de support',
    },
    {
      id: 'dictations',
      label: 'Dictées',
      icon: BookOpen,
      description: 'Gestion du contenu pédagogique',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Statistiques détaillées',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration de la plateforme',
    },
  ];

  const handleNavigate = (section: string, data?: any) => {
    setCurrentSection(section);
    setSectionData(data);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Loading state
  if (loading || checkingPermissions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </Card>
      </div>
    );
  }

  // Pas d'accès admin
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <Shield className="mx-auto mb-4 size-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="mb-6 text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section. Seuls les
            administrateurs peuvent accéder au panneau d'administration.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => (window.location.href = '/dashboard')} variant="secondary">
              Retour au tableau de bord
            </Button>
            <Button onClick={handleLogout}>Se déconnecter</Button>
          </div>
        </Card>
      </div>
    );
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;

      case 'users':
        return <UserManagement onNavigate={handleNavigate} />;

      case 'users-create':
        return (
          <CreateUserForm
            onBack={() => handleNavigate('users')}
            onSuccess={() => handleNavigate('users')}
          />
        );

      case 'users-edit':
        return (
          <div className="py-12 text-center">
            <p className="text-gray-600">Modification d'utilisateur - À implémenter</p>
            <Button onClick={() => handleNavigate('users')} className="mt-4">
              Retour à la liste
            </Button>
          </div>
        );

      case 'subscriptions':
        return <AdminSubscriptions />;

      case 'support':
        return <AdminSupport />;

      case 'dictations':
        return <AdminDictations />;

      case 'analytics':
        return <AdminAnalytics />;

      case 'settings':
        return <AdminSettings />;

      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col border-r border-gray-200 bg-white transition-all duration-300`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">FrançaisFluide</p>
              </div>
            )}
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="secondary"
              size="sm"
              className="p-2"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive =
                currentSection === item.id ||
                (currentSection.startsWith(item.id + '-') && item.id !== 'dashboard');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border border-blue-200 bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-medium text-blue-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">Administrateur</div>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="mt-3 flex w-full items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderCurrentSection()}</div>
      </div>
    </div>
  );
}
