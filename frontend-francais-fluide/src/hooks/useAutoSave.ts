import { useState, useEffect, useCallback, useRef } from 'react';
import { persistenceManager, type PersistedDocument } from '@/lib/storage/persistence';

interface UseAutoSaveOptions {
  documentId: string;
  title: string;
  content: string;
  enabled?: boolean;
  debounceMs?: number;
  saveIntervalMs?: number;
  onSave?: (document: PersistedDocument) => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: string | null;
  saveNow: () => Promise<void>;
  forceSave: () => Promise<void>;
}

export function useAutoSave({
  documentId,
  title,
  content,
  enabled = true,
  debounceMs = 2000,
  saveIntervalMs = 30000,
  onSave,
  onError
}: UseAutoSaveOptions): UseAutoSaveReturn {
  // État de la sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs pour éviter les re-renders inutiles
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(content);
  const lastTitleRef = useRef<string>(title);
  const isInitialLoadRef = useRef<boolean>(true);

  // Fonction de sauvegarde
  const saveDocument = useCallback(async (force = false) => {
    if (!enabled || isSaving) return;

    // Vérifier si le contenu a changé
    const contentChanged = content !== lastContentRef.current;
    const titleChanged = title !== lastTitleRef.current;
    
    if (!force && !contentChanged && !titleChanged) return;

    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      const document: Omit<PersistedDocument, 'version' | 'isDirty'> = {
        id: documentId,
        title,
        content,
        lastModified: new Date(),
        metadata: {
          wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: content.length,
          language: 'fr',
          author: 'user' // À remplacer par l'utilisateur réel
        }
      };

      await persistenceManager.saveDocument(document);
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      lastContentRef.current = content;
      lastTitleRef.current = title;

      onSave?.(document as PersistedDocument);

      // Réinitialiser le statut après 2 secondes
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur de sauvegarde');
      setError(error.message);
      setSaveStatus('error');
      onError?.(error);
      
      // Réinitialiser le statut d'erreur après 5 secondes
      setTimeout(() => {
        setSaveStatus('idle');
        setError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  }, [documentId, title, content, enabled, isSaving, onSave, onError]);

  // Sauvegarde avec debouncing
  const debouncedSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      saveDocument();
    }, debounceMs);
  }, [saveDocument, debounceMs]);

  // Sauvegarde immédiate
  const saveNow = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    await saveDocument(true);
  }, [saveDocument]);

  // Sauvegarde forcée (ignore les vérifications)
  const forceSave = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    await saveDocument(true);
  }, [saveDocument]);

  // Charger le document existant au montage
  useEffect(() => {
    const loadExistingDocument = async () => {
      try {
        const existingDoc = await persistenceManager.loadDocument(documentId);
        if (existingDoc) {
          setLastSaved(existingDoc.lastModified);
          setHasUnsavedChanges(false);
          lastContentRef.current = existingDoc.content;
          lastTitleRef.current = existingDoc.title;
        }
      } catch (err) {
        console.error('Erreur lors du chargement du document:', err);
      } finally {
        isInitialLoadRef.current = false;
      }
    };

    loadExistingDocument();
  }, [documentId]);

  // Sauvegarde automatique lors des changements
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const contentChanged = content !== lastContentRef.current;
    const titleChanged = title !== lastTitleRef.current;

    if (contentChanged || titleChanged) {
      setHasUnsavedChanges(true);
      debouncedSave();
    }
  }, [content, title, debouncedSave]);

  // Sauvegarde périodique
  useEffect(() => {
    if (!enabled) return;

    saveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        saveDocument();
      }
    }, saveIntervalMs);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [enabled, hasUnsavedChanges, isSaving, saveDocument, saveIntervalMs]);

  // Sauvegarde avant la fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
        return event.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        // Sauvegarder immédiatement quand la page devient cachée
        saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges, saveNow]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveStatus,
    error,
    saveNow,
    forceSave
  };
}
