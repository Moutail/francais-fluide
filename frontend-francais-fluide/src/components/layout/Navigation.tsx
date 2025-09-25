'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/professional/Button';
import { useAuth } from '@/contexts/AuthContext';
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
  X,
  Sparkles
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
    <div className="sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60 bg-gradient-to-r from-white/80 via-white/70 to-white/80 backdrop-blur-xl border-b border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md shadow-accent-500/20 ring-1 ring-white/40">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-primary-900 hidden sm:block tracking-tight">
              FrançaisFluide
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 max-w-4xl">
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Tableau de bord</span>
                  <span className="xl:hidden">Dashboard</span>
                </a>
                <a href="/progression" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Progression</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a href="/exercices" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Exercices</span>
                  <span className="xl:hidden">Exos</span>
                </a>
                <a href="/dictation" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <Volume2 className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Dictées</span>
                  <span className="xl:hidden">Audio</span>
                </a>
                <a href="/dissertation" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap relative">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Dissertations</span>
                  <span className="xl:hidden">Dissert</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                </a>
                <a href="/analytics" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Analytics</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a href="/subscription" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Abonnements</span>
                  <span className="xl:hidden">Pro</span>
                </a>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <a href="/profile" className="text-xs text-gray-700 font-medium truncate max-w-24 hover:text-primary-900" title="Voir mon profil">
                      {user?.name || 'Utilisateur'}
                    </a>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = '/settings')}
                      className="p-1.5 text-gray-500 hover:text-primary-900 hover:bg-white/70 rounded-full"
                      title="Paramètres"
                      aria-label="Ouvrir les paramètres"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <a
                      href="/support"
                      className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-primary-900 hover:bg-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500/40 transition-all duration-200"
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
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
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
                <a href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Accueil</span>
                  <span className="xl:hidden">Home</span>
                </a>
                <a href="/demo" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Démonstration</span>
                  <span className="xl:hidden">Demo</span>
                </a>
                <a href="/progression" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Progression</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a href="/exercices" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Exercices</span>
                  <span className="xl:hidden">Exos</span>
                </a>
                <a href="/subscription" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-900 hover:bg-white/70 px-2.5 py-2 rounded-full transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/40 whitespace-nowrap">
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">Abonnements</span>
                  <span className="xl:hidden">Pro</span>
                </a>
                <Button
                  onClick={() => (window.location.href = '/auth/login')}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 ml-2 rounded-full shadow-sm text-xs px-3 py-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline">Se connecter</span>
                  <span className="xl:hidden">Login</span>
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
              className="p-2 text-gray-600 hover:text-primary-900 hover:bg-white/70 rounded-full" 
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/30 supports-[backdrop-filter]:bg-white/60 bg-gradient-to-r from-white/80 via-white/70 to-white/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <a 
                    href="/dashboard" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Tableau de bord
                  </a>
                  <a 
                    href="/progression" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Progression
                  </a>
                  <a 
                    href="/exercices" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Exercices
                  </a>
                  <a 
                    href="/dictation" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <Volume2 className="w-5 h-5" />
                    Dictées
                  </a>
                  <a 
                    href="/dissertation" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium relative"
                  >
                    <Sparkles className="w-5 h-5" />
                    Dissertations
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  </a>
                  <a 
                    href="/analytics" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </a>
                  <a 
                    href="/subscription" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
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
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <Settings className="w-5 h-5" />
                      Mon profil
                    </a>
                    <a 
                      href="/support" 
                      onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
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
                    className="flex items-center gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium w-full text-left"
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
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Accueil
                  </a>
                  <a 
                    href="/demo" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Démonstration
                  </a>
                  <a 
                    href="/progression" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Progression
                  </a>
                  <a 
                    href="/exercices" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    Exercices
                  </a>
                  <a 
                    href="/subscription" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-primary-900 hover:bg-white/70 px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium"
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
                      className="w-full gap-2 rounded-xl shadow-sm"
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