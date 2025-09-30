'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Edit3,
  BookOpen,
  User,
  Trophy,
  Target,
  Settings,
  ChevronRight,
  BarChart3,
  Calendar,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: SidebarItem[];
}

const getSidebarItems = (exerciseCount: number): SidebarItem[] => [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Éditeur',
    href: '/editor',
    icon: Edit3,
  },
  {
    name: 'Exercices',
    href: '/exercices',
    icon: BookOpen,
    badge: exerciseCount > 0 ? exerciseCount.toString() : undefined,
  },
  {
    name: 'Progression',
    href: '/progression',
    icon: BarChart3,
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Succès',
    href: '/achievements',
    icon: Trophy,
  },
  {
    name: 'Missions',
    href: '/missions',
    icon: Target,
  },
  {
    name: 'Calendrier',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [exerciseCount, setExerciseCount] = useState(0);

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) return;

        // Charger la progression
        const progressResponse = await fetch('/api/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          if (data.success) setUserProgress(data.data);
        }

        // Charger le nombre d'exercices
        const exercisesResponse = await fetch('/api/exercises', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (exercisesResponse.ok) {
          const exercisesData = await exercisesResponse.json();
          if (exercisesData.success) {
            setExerciseCount(exercisesData.data.length);
          }
        }
      } catch (e) {
        // silencieux
      }
    };
    loadUserProgress();
  }, []);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName) ? prev.filter(name => name !== itemName) : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-16">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-6">
          {getSidebarItems(exerciseCount).map(item => {
            const isItemActive = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isItemActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    <ChevronRight
                      className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isItemActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sous-éléments */}
                {hasChildren && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-1 space-y-1"
                  >
                    {item.children!.map(child => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive(child.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <child.icon className="mr-3 h-4 w-4" />
                        {child.name}
                        {child.badge && (
                          <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Objectifs du jour (données réelles) */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Objectifs du jour</h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mots à écrire</span>
                  <span className="font-medium text-gray-900">
                    {Math.max(0, userProgress?.wordsWritten || 0)}/500
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(((userProgress?.wordsWritten || 0) / 500) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Précision cible</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(userProgress?.accuracy || 0)}%/90%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(((userProgress?.accuracy || 0) / 90) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Succès récents (dérivés) */}
        <div className="px-4 py-4">
          <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
            <div className="mb-2 flex items-center">
              <Award className="mr-2 h-4 w-4 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-900">Succès récents</h3>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              {userProgress?.currentStreak >= 7 && <p>Série de 7 jours complétée</p>}
              {userProgress?.wordsWritten >= 100 && <p>100 mots écrits</p>}
              {!userProgress && <p>Commencez à écrire pour débloquer vos succès</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
