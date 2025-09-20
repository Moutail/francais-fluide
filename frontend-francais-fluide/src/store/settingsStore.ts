// src/store/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Préférences d'apprentissage
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    focusAreas: string[];
    dailyGoal: number; // minutes par jour
    reminderEnabled: boolean;
    reminderTime: string; // format HH:MM
  };
  
  // Interface utilisateur
  ui: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
    compactMode: boolean;
  };
  
  // Feedback
  feedback: {
    soundEffects: boolean;
    hapticFeedback: boolean;
    visualEffects: boolean;
    celebrations: boolean;
    notifications: boolean;
  };
  
  // Confidentialité
  privacy: {
    shareProgress: boolean;
    anonymousAnalytics: boolean;
    saveHistory: boolean;
    syncAcrossDevices: boolean;
  };

  // Actions
  updatePreferences: (prefs: Partial<SettingsState['preferences']>) => void;
  updateUI: (ui: Partial<SettingsState['ui']>) => void;
  updateFeedback: (feedback: Partial<SettingsState['feedback']>) => void;
  updatePrivacy: (privacy: Partial<SettingsState['privacy']>) => void;
  resetSettings: () => void;
}

const defaultSettings: Omit<SettingsState, 'updatePreferences' | 'updateUI' | 'updateFeedback' | 'updatePrivacy' | 'resetSettings'> = {
  preferences: {
    difficulty: 'adaptive',
    focusAreas: [],
    dailyGoal: 15,
    reminderEnabled: false,
    reminderTime: '20:00',
  },
  ui: {
    theme: 'system',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
  },
  feedback: {
    soundEffects: true,
    hapticFeedback: true,
    visualEffects: true,
    celebrations: true,
    notifications: true,
  },
  privacy: {
    shareProgress: false,
    anonymousAnalytics: true,
    saveHistory: true,
    syncAcrossDevices: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      updateUI: (ui) =>
        set((state) => ({
          ui: { ...state.ui, ...ui },
        })),

      updateFeedback: (feedback) =>
        set((state) => ({
          feedback: { ...state.feedback, ...feedback },
        })),

      updatePrivacy: (privacy) =>
        set((state) => ({
          privacy: { ...state.privacy, ...privacy },
        })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
    }
  )
);