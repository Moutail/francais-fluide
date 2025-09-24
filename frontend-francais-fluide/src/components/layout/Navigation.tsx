'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/professional/Button';
import { useAuth } from '@/hooks/useApi';
import { 
  Home, 
  TrendingUp, 
  BookOpen, 
  Crown, 
  User, 
  LogOut,
  Settings,
  Volume2,
  BarChart3,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-primary-900 hidden sm:block">
              FrançaisFluide
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <Home className="w-4 h-4" />
                  Tableau de bord
                </a>
                <a href="/progression" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Progression
                </a>
                <a href="/exercices" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Exercices
                </a>
                <a href="/dictations" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <Volume2 className="w-4 h-4" />
                  Dictées
                </a>
                <a href="/analytics" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </a>
                <a href="/subscription" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Abonnements
                </a>
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium">{user?.name || 'Utilisateur'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = '/profile')}
                      className="p-2 text-gray-500 hover:text-primary-900 hover:bg-gray-100"
                      title="Mon profil"
                      aria-label="Ouvrir mon profil"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <a
                      href="/support"
                      className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-primary-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200"
                      title="Support"
                      aria-label="Ouvrir le support"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      title="Se déconnecter"
                      aria-label="Se déconnecter"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <Home className="w-4 h-4" />
                  Accueil
                </a>
                <a href="/demo" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Démonstration
                </a>
                <a href="/progression" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Progression
                </a>
                <a href="/exercices" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Exercices
                </a>
                <a href="/subscription" className="flex items-center gap-2 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Abonnements
                </a>
                <Button
                  onClick={() => (window.location.href = '/auth/login')}
                  variant="primary"
                  size="md"
                  className="gap-2 ml-2"
                >
                  <User className="w-4 h-4" />
                  Se connecter
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-primary-900 hover:bg-gray-100" 
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <a 
                    href="/dashboard" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Tableau de bord
                  </a>
                  <a 
                    href="/progression" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Progression
                  </a>
                  <a 
                    href="/exercices" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Exercices
                  </a>
                  <a 
                    href="/dictations" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <Volume2 className="w-5 h-5" />
                    Dictées
                  </a>
                  <a 
                    href="/analytics" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </a>
                  <a 
                    href="/subscription" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <Crown className="w-5 h-5" />
                    Abonnements
                  </a>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-base text-gray-700 font-medium">{user?.name || 'Utilisateur'}</span>
                    </div>
                    <a 
                      href="/profile" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                    >
                      <Settings className="w-5 h-5" />
                      Mon profil
                    </a>
                    <a 
                      href="/support" 
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Support
                    </a>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Se déconnecter
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a 
                    href="/" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Accueil
                  </a>
                  <a 
                    href="/demo" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Démonstration
                  </a>
                  <a 
                    href="/progression" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Progression
                  </a>
                  <a 
                    href="/exercices" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Exercices
                  </a>
                  <a 
                    href="/subscription" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-900 hover:bg-gray-50 px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium"
                  >
                    <Crown className="w-5 h-5" />
                    Abonnements
                  </a>
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <Button
                      onClick={() => {
                        window.location.href = '/auth/login';
                        closeMobileMenu();
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full gap-2"
                    >
                      <User className="w-5 h-5" />
                      Se connecter
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}