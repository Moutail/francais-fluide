// src/hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, UserStatistics } from '@/types/user';

const PROFILE_QUERY_KEY = ['user', 'profile'];

export function useUserProfile() {
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<UserProfile> => {
      // Simuler un appel API
      return {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Utilisateur Test',
        level: 'intermediate',
        nativeLanguage: 'fr',
        weaknesses: ['accord', 'conjugaison'],
        strengths: ['orthographe', 'ponctuation'],
        preferences: {
          realTimeCorrection: true,
          soundEffects: true,
          animations: true,
          difficulty: 'medium'
        },
        statistics: {
          totalWords: 0,
          totalErrors: 0,
          totalCorrections: 0,
          accuracyRate: 100,
          dailyStreak: 0,
          bestStreak: 0,
          totalPracticeTime: 0,
          lastPracticeDate: new Date(),
          progressByCategory: {}
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      // Simuler une mise à jour API
      return { ...profile, ...updates };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    }
  });

  const updateStatistics = useCallback((stats: Partial<UserStatistics>) => {
    if (!profile) return;
    
    updateProfile.mutate({
      statistics: {
        ...profile.statistics,
        ...stats
      }
    });
  }, [profile, updateProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    updateStatistics
  };
}