'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, User, Settings, LogOut, Sun, Moon, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/professional/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-accent-500 shadow-sm">
                <span className="text-lg font-bold text-white">F</span>
              </div>
              <span className="text-xl font-bold text-primary-900">FrançaisFluide</span>
            </Link>

            {/* Navigation desktop */}
            <nav className="ml-10 hidden space-x-8 md:flex">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tableau de bord
              </Link>
              <Link
                href="/editor"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Éditeur
              </Link>
              <Link
                href="/exercises"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Exercices
              </Link>
            </nav>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche */}
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bouton mode sombre */}
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2">
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="size-5" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>

            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="flex items-center space-x-2 p-2"
              >
                <User className="size-5" />
                <span className="hidden text-sm font-medium sm:block">Marie</span>
              </Button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-3 size-4" />
                    Mon profil
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="mr-3 size-4" />
                    Paramètres
                  </Link>
                  <hr className="my-1" />
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Logique de déconnexion
                    }}
                  >
                    <LogOut className="mr-3 size-4" />
                    Se déconnecter
                  </button>
                </motion.div>
              )}
            </div>

            {/* Menu mobile */}
            <Button variant="ghost" size="sm" onClick={toggleMenu} className="p-2 md:hidden">
              <Menu className="size-5" />
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 py-4 md:hidden"
          >
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                href="/editor"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Éditeur
              </Link>
              <Link
                href="/exercises"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Exercices
              </Link>
              <Link
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Mon profil
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};
