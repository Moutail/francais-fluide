'use client';

import React from 'react';
import { useAuth } from '@/hooks/useApi';
import { 
  Home, 
  TrendingUp, 
  BookOpen, 
  Crown, 
  User, 
  LogOut,
  Settings
} from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FrançaisFluide
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <Home className="w-4 h-4" />
                  Dashboard
                </a>
                <a href="/progression" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  Progression
                </a>
                <a href="/exercices" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Exercices
                </a>
                <a href="/subscription" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <Crown className="w-4 h-4" />
                  Abonnements
                </a>
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Bonjour, {user?.name || 'Utilisateur'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => window.location.href = '/profile'}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Mon profil"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Se déconnecter"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <Home className="w-4 h-4" />
                  Accueil
                </a>
                <a href="/demo" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Démo
                </a>
                <a href="/progression" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  Progression
                </a>
                <a href="/exercices" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Exercices
                </a>
                <a href="/subscription" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors">
                  <Crown className="w-4 h-4" />
                  Abonnements
                </a>
                <button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Se connecter
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
