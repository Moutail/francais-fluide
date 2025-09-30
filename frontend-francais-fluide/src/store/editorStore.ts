// src/store/editorStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GrammarError } from '@/types/grammar';

interface EditorState {
  // État du texte
  text: string;
  savedText: string;
  hasUnsavedChanges: boolean;

  // Erreurs et corrections
  errors: GrammarError[];
  corrections: Map<string, string>;
  ignoredErrors: Set<string>;

  // Métriques de session
  sessionMetrics: {
    startTime: Date;
    wordsWritten: number;
    errorsDetected: number;
    errorsCorrected: number;
    timeSpent: number;
  };

  // Configuration
  settings: {
    autoSave: boolean;
    realTimeCorrection: boolean;
    showSuggestions: boolean;
    highlightErrors: boolean;
    soundEffects: boolean;
  };

  // Actions
  setText: (text: string) => void;
  saveText: () => void;
  setErrors: (errors: GrammarError[]) => void;
  addCorrection: (errorId: string, correction: string) => void;
  ignoreError: (errorId: string) => void;
  updateSessionMetric: (metric: keyof EditorState['sessionMetrics'], value: any) => void;
  updateSettings: (settings: Partial<EditorState['settings']>) => void;
  resetSession: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    text: '',
    savedText: '',
    hasUnsavedChanges: false,
    errors: [],
    corrections: new Map(),
    ignoredErrors: new Set(),

    sessionMetrics: {
      startTime: new Date(),
      wordsWritten: 0,
      errorsDetected: 0,
      errorsCorrected: 0,
      timeSpent: 0,
    },

    settings: {
      autoSave: true,
      realTimeCorrection: true,
      showSuggestions: true,
      highlightErrors: true,
      soundEffects: true,
    },

    setText: text =>
      set(state => {
        state.text = text;
        state.hasUnsavedChanges = text !== state.savedText;

        // Mise à jour des métriques
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        state.sessionMetrics.wordsWritten = wordCount;
      }),

    saveText: () =>
      set(state => {
        state.savedText = state.text;
        state.hasUnsavedChanges = false;
      }),

    setErrors: errors =>
      set(state => {
        state.errors = errors;
        state.sessionMetrics.errorsDetected = errors.length;
      }),

    addCorrection: (errorId, correction) =>
      set(state => {
        state.corrections.set(errorId, correction);
        state.sessionMetrics.errorsCorrected++;
      }),

    ignoreError: errorId =>
      set(state => {
        state.ignoredErrors.add(errorId);
      }),

    updateSessionMetric: (metric, value) =>
      set(state => {
        (state.sessionMetrics as any)[metric] = value;
      }),

    updateSettings: settings =>
      set(state => {
        Object.assign(state.settings, settings);
      }),

    resetSession: () =>
      set(state => {
        state.text = '';
        state.savedText = '';
        state.hasUnsavedChanges = false;
        state.errors = [];
        state.corrections.clear();
        state.ignoredErrors.clear();
        state.sessionMetrics = {
          startTime: new Date(),
          wordsWritten: 0,
          errorsDetected: 0,
          errorsCorrected: 0,
          timeSpent: 0,
        };
      }),
  }))
);
