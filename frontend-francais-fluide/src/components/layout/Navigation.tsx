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
  Sparkles,
  Shield,
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
    <div className="nav-glass sticky top-0 z-50 border-b border-white/30 bg-gradient-to-r from-white/80 via-white/70 to-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/icons/francaifluide.svg"
              alt="FrançaisFluide"
              className="size-9 rounded-xl shadow-md ring-1 ring-white/40"
            />
            <span className="hidden text-xl font-bold tracking-tight text-primary-900 sm:block">
              FrançaisFluide
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden max-w-4xl items-center gap-1 lg:flex">
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Home className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Tableau de bord</span>
                  <span className="xl:hidden">Dashboard</span>
                </a>
                <a
                  href="/progression"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <TrendingUp className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Progression</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a
                  href="/exercices"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <BookOpen className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Exercices</span>
                  <span className="xl:hidden">Exos</span>
                </a>
                <a
                  href="/dictation"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Volume2 className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Dictées</span>
                  <span className="xl:hidden">Audio</span>
                </a>
                <a
                  href="/dissertation"
                  className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Sparkles className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Dissertations</span>
                  <span className="xl:hidden">Dissert</span>
                  <div className="absolute -right-1 -top-1 size-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                </a>
                <a
                  href="/analytics"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <BarChart3 className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Analytics</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a
                  href="/subscription"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Crown className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Abonnements</span>
                  <span className="xl:hidden">Pro</span>
                </a>
                {/* Lien admin pour les administrateurs */}
                {user?.role && ['admin', 'super_admin'].includes(user.role) && (
                  <a
                    href="/admin"
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  >
                    <Shield className="size-4 shrink-0" />
                    <span className="hidden xl:inline">Administration</span>
                    <span className="xl:hidden">Admin</span>
                  </a>
                )}
                <div className="ml-2 flex items-center gap-2 border-l border-white/50 pl-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <User className="size-4 shrink-0 text-gray-500" />
                    <a
                      href="/profile"
                      className="max-w-24 truncate text-xs font-medium text-gray-700 hover:text-primary-900"
                      title="Voir mon profil"
                    >
                      {user?.name || 'Utilisateur'}
                    </a>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = '/settings')}
                      className="rounded-full p-1.5 text-gray-500 hover:bg-white/70 hover:text-primary-900"
                      title="Paramètres"
                      aria-label="Ouvrir les paramètres"
                    >
                      <Settings className="size-4" />
                    </Button>
                    <a
                      href="/support"
                      className="inline-flex items-center justify-center rounded-full p-1.5 text-gray-500 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                      title="Support"
                      aria-label="Ouvrir le support"
                    >
                      <HelpCircle className="size-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                      }}
                      className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Se déconnecter"
                      aria-label="Se déconnecter"
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Home className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Accueil</span>
                  <span className="xl:hidden">Home</span>
                </a>
                <a
                  href="/demo"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <BookOpen className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Démonstration</span>
                  <span className="xl:hidden">Demo</span>
                </a>
                <a
                  href="/progression"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <TrendingUp className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Progression</span>
                  <span className="xl:hidden">Stats</span>
                </a>
                <a
                  href="/exercices"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <BookOpen className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Exercices</span>
                  <span className="xl:hidden">Exos</span>
                </a>
                <a
                  href="/subscription"
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-white/70 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  <Crown className="size-4 shrink-0" />
                  <span className="hidden xl:inline">Abonnements</span>
                  <span className="xl:hidden">Pro</span>
                </a>
                <Button
                  onClick={() => (window.location.href = '/auth/login')}
                  variant="primary"
                  size="sm"
                  className="ml-2 gap-1.5 rounded-full px-3 py-2 text-xs shadow-sm"
                >
                  <User className="size-4" />
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
              className="rounded-full p-2 text-gray-600 hover:bg-white/70 hover:text-primary-900"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/30 bg-gradient-to-r from-white/80 via-white/70 to-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {isAuthenticated ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <Home className="size-5" />
                    Tableau de bord
                  </a>
                  <a
                    href="/progression"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <TrendingUp className="size-5" />
                    Progression
                  </a>
                  <a
                    href="/exercices"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <BookOpen className="size-5" />
                    Exercices
                  </a>
                  <a
                    href="/dictation"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <Volume2 className="size-5" />
                    Dictées
                  </a>
                  <a
                    href="/dissertation"
                    onClick={closeMobileMenu}
                    className="relative flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <Sparkles className="size-5" />
                    Dissertations
                    <div className="size-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  </a>
                  <a
                    href="/analytics"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <BarChart3 className="size-5" />
                    Analytics
                  </a>
                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    Accueil
                  </a>
                  <a
                    href="/demo"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <BookOpen className="size-5" />
                    Démonstration
                  </a>
                  <a
                    href="/progression"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <TrendingUp className="size-5" />
                    Progression
                  </a>
                  <a
                    href="/exercices"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <BookOpen className="size-5" />
                    Exercices
                  </a>
                  <a
                    href="/subscription"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl p-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-900"
                  >
                    <Crown className="size-5" />
                    Abonnements
                  </a>
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <Button
                      onClick={() => {
                        window.location.href = '/auth/login';
                        closeMobileMenu();
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full gap-2 rounded-xl shadow-sm"
                    >
                      <User className="size-5" />
                      Se connecter
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <Button
                    onClick={() => {
                      window.location.href = '/auth/login';
                      closeMobileMenu();
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full gap-2 rounded-xl shadow-sm"
                  >
                    <User className="size-5" />
                    Se connecter
                  </Button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
