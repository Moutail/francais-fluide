// src/components/navigation/Navbar.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  TrendingUp,
  BookOpen,
  Target,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SimpleAIAssistant } from '@/components/ai/SimpleAIAssistant';

interface NavbarProps {
  currentPage?: string;
  userPlan?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, userPlan = 'free' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Sparkles },
    { name: 'Progression', href: '/progression', icon: TrendingUp },
    { name: 'Exercices', href: '/exercices', icon: BookOpen },
    { name: 'Démo', href: '/demo', icon: Target },
    { name: 'Abonnements', href: '/subscription', icon: Crown },
  ];

  const isActive = (href: string) => {
    if (href === '/' && currentPage === '/') return true;
    if (href !== '/' && currentPage?.startsWith(href)) return true;
    return false;
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex cursor-pointer items-center gap-2"
            whileHover={{ scale: 1.05 }}
            onClick={() => (window.location.href = '/')}
          >
            <div className="relative">
              <Sparkles className="size-8 text-blue-600" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="size-8 text-blue-400 opacity-50" />
              </motion.div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
              FrançaisFluide
            </span>
          </motion.div>

          {/* Navigation Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            {navigationItems.map(item => (
              <motion.a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-all',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                whileHover={{ y: -2 }}
              >
                <item.icon className="size-4" />
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden items-center gap-4 md:flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = '/auth/login')}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl"
            >
              Se connecter
            </motion.button>

            {/* Menu utilisateur (simulé) */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <User className="size-5 text-gray-600" />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
                  >
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4" />
                      Mon profil
                    </button>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </button>
                    <hr className="my-2" />
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Menu Mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </motion.button>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 py-4 md:hidden"
            >
              <nav className="space-y-2">
                {navigationItems.map(item => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    whileHover={{ x: 4 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="size-5" />
                    {item.name}
                  </motion.a>
                ))}
                <div className="border-t border-gray-200 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.location.href = '/auth/login';
                      setIsMenuOpen(false);
                    }}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg"
                  >
                    Se connecter
                  </motion.button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Assistant IA Widget */}
      <SimpleAIAssistant userPlan={userPlan} />
    </motion.header>
  );
};
