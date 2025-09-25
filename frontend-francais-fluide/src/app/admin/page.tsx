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
  AlertTriangle,
  Crown,
  BarChart3
} from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CreateUserForm from '@/components/admin/CreateUserForm';

export default function AdminPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sectionData, setSectionData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Vérifier les permissions admin
      checkAdminPermissions();
    } else if (!loading && !isAuthenticated) {
      // Rediriger vers la connexion si pas authentifié
      window.location.href = '/auth/login';
    }
  }, [user, loading, isAuthenticated]);

  const checkAdminPermissions = async () => {
    try {
      // Essayer d'accéder au dashboard admin pour vérifier les permissions
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      description: 'Vue d\'ensemble et statistiques'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des comptes utilisateurs'
    },
    {
      id: 'subscriptions',
      label: 'Abonnements',
      icon: CreditCard,
      description: 'Gestion des plans et facturations'
    },
    {
      id: 'support',
      label: 'Support',
      icon: MessageCircle,
      description: 'Messages et tickets de support'
    },
    {
      id: 'dictations',
      label: 'Dictées',
      icon: BookOpen,
      description: 'Gestion du contenu pédagogique'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Statistiques détaillées'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration de la plateforme'
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </Card>
      </div>
    );
  }

  // Pas d'accès admin
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            Seuls les administrateurs peuvent accéder au panneau d'administration.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
              Retour au tableau de bord
            </Button>
            <Button onClick={handleLogout}>
              Se déconnecter
            </Button>
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
          <div className="text-center py-12">
            <p className="text-gray-600">Modification d'utilisateur - À implémenter</p>
            <Button onClick={() => handleNavigate('users')} className="mt-4">
              Retour à la liste
            </Button>
          </div>
        );
      
      case 'subscriptions':
        return (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestion des abonnements</h2>
            <p className="text-gray-600 mb-4">Interface de gestion des abonnements - À implémenter</p>
            <Button onClick={() => handleNavigate('dashboard')}>
              Retour au tableau de bord
            </Button>
          </div>
        );
      
      case 'support':
        return (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Support client</h2>
            <p className="text-gray-600 mb-4">Interface de gestion du support - À implémenter</p>
            <Button onClick={() => handleNavigate('dashboard')}>
              Retour au tableau de bord
            </Button>
          </div>
        );
      
      case 'dictations':
        return (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestion des dictées</h2>
            <p className="text-gray-600 mb-4">Interface de gestion du contenu - À implémenter</p>
            <Button onClick={() => handleNavigate('dashboard')}>
              Retour au tableau de bord
            </Button>
          </div>
        );
      
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">FrançaisFluide</p>
              </div>
            )}
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              size="sm"
              className="p-2"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id || 
                             (currentSection.startsWith(item.id + '-') && item.id !== 'dashboard');
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
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
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500">Administrateur</div>
              </div>
            )}
          </div>
          
          {sidebarOpen && (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full mt-3 flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
}