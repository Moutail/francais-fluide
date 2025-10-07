'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SmartEditor } from '@/components/editor/SmartEditor';
// import { EditorToolbar } from '@/components/editor/EditorToolbar';
import Navigation from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button } from '@/components/ui';
import { Save, Download, Share2, Settings, RotateCcw, User, Target, Award } from 'lucide-react';
import type { ProgressMetrics } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

export default function EditorPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam' | 'creative'>('practice');
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedMetrics, setLastSavedMetrics] = useState<ProgressMetrics | null>(null);
  
  // Debounce des métriques pour éviter trop de requêtes
  const debouncedMetrics = useDebounce(metrics, 3000); // 3 secondes de délai
  const saveInProgressRef = useRef(false);

  // Charger les données utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProgress();
    }
  }, [isAuthenticated, user]);

  // Restaurer le brouillon sauvegardé au chargement
  useEffect(() => {
    const savedDraft = localStorage.getItem('editor_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const savedDate = new Date(draft.savedAt);
        const now = new Date();
        const hoursSinceLastSave = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);

        // Proposer de restaurer si sauvegardé il y a moins de 24h
        if (hoursSinceLastSave < 24) {
          const restore = confirm(
            `📝 Un brouillon a été trouvé (sauvegardé ${savedDate.toLocaleString('fr-FR')}).\n\nVoulez-vous le restaurer ?`
          );
          if (restore) {
            setText(draft.content || '');
            setMode(draft.mode || 'practice');
            setMetrics(draft.metrics || null);
            console.log('✅ Brouillon restauré');
          }
        }
      } catch (error) {
        console.error('Erreur restauration brouillon:', error);
      }
    }
  }, []);

  const loadUserProgress = async () => {
    try {
      const response = await fetch('/api/progress', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProgress(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement progression:', error);
    }
  };

  const handleProgressUpdate = (newMetrics: ProgressMetrics, newText?: string) => {
    setMetrics(newMetrics);
    if (newText !== undefined) {
      setText(newText);
    }
    // La sauvegarde se fera automatiquement via useEffect avec debounce
  };

  // Sauvegarder automatiquement avec debounce
  useEffect(() => {
    const saveProgress = async () => {
      // Ne pas sauvegarder si pas authentifié, pas de métriques, ou sauvegarde en cours
      if (!isAuthenticated || !debouncedMetrics || saveInProgressRef.current) {
        return;
      }

      // Ne sauvegarder que si les métriques ont changé
      if (lastSavedMetrics && 
          lastSavedMetrics.wordsWritten === debouncedMetrics.wordsWritten &&
          lastSavedMetrics.accuracyRate === debouncedMetrics.accuracyRate) {
        return;
      }

      saveInProgressRef.current = true;
      try {
        await fetch('/api/progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            wordsWritten: debouncedMetrics.wordsWritten,
            accuracy: debouncedMetrics.accuracyRate,
            timeSpent: 0,
            exercisesCompleted: 0,
            currentStreak: debouncedMetrics.streakCount,
          }),
        });
        setLastSavedMetrics(debouncedMetrics);
      } catch (error) {
        console.error('Erreur sauvegarde progression:', error);
      } finally {
        saveInProgressRef.current = false;
      }
    };

    saveProgress();
  }, [debouncedMetrics, isAuthenticated, lastSavedMetrics]);
  const handleSave = async () => {
    console.log('🔍 handleSave appelé');
    console.log('📝 Texte actuel:', text);
    console.log('📊 Métriques:', metrics);
    
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Texte vide');
      alert('⚠️ Aucun texte à sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      // Sauvegarder dans localStorage
      const savedData = {
        content: text,
        mode: mode,
        metrics: metrics,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('editor_draft', JSON.stringify(savedData));
      console.log('✅ Texte sauvegardé localement');

      // Essayer de sauvegarder sur le serveur (optionnel)
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/editor/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(savedData),
          });

          if (response.ok) {
            console.log('✅ Texte sauvegardé sur le serveur');
          }
        } catch (serverError) {
          console.warn('⚠️ Serveur non disponible');
        }
      }

      alert('✅ Texte sauvegardé avec succès !');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!text || text.trim().length === 0) {
      alert('⚠️ Aucun texte à exporter');
      return;
    }

    try {
      // Créer le contenu avec métadonnées
      const exportContent = `
========================================
Français Fluide - Export de texte
========================================
Date: ${new Date().toLocaleString('fr-FR')}
Mode: ${mode}
Mots écrits: ${metrics?.wordsWritten || 0}
Précision: ${metrics?.accuracyRate || 0}%
========================================

${text}

========================================
Statistiques:
- Caractères: ${text.length}
- Mots: ${text.split(/\s+/).filter(w => w.length > 0).length}
- Lignes: ${text.split('\n').length}
========================================
      `.trim();

      const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nom de fichier avec date
      const date = new Date().toISOString().split('T')[0];
      a.download = `francais-fluide-${date}.txt`;
      
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Texte exporté avec succès');
      alert('✅ Texte exporté avec succès !');
    } catch (error) {
      console.error('❌ Erreur export:', error);
      alert('❌ Erreur lors de l\'export');
    }
  };

  const handleReset = () => {
    console.log('🔍 handleReset appelé');
    
    if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'éditeur ? Tout le texte sera perdu.')) {
      console.log('✅ Confirmation reçue');
      setText('');
      setMetrics(null);
      console.log('✅ Éditeur réinitialisé');
    } else {
      console.log('❌ Annulé par l\'utilisateur');
    }
  };

  const handleShare = async () => {
    console.log('🔍 handleShare appelé');
    console.log('📝 Texte à partager:', text);
    
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Texte vide');
      alert('⚠️ Aucun texte à partager');
      return;
    }

    try {
      console.log('🔄 Tentative de partage...');
      // Créer un résumé du texte
      const summary = text.length > 100 ? text.substring(0, 100) + '...' : text;
      const shareData = {
        title: 'Mon texte - Français Fluide',
        text: `${summary}\n\nÉcrit avec Français Fluide - ${metrics?.wordsWritten || 0} mots, ${metrics?.accuracyRate || 0}% de précision`,
        url: window.location.href,
      };

      // Vérifier si l'API Web Share est disponible
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('✅ Texte partagé avec succès');
      } else {
        // Fallback : Copier dans le presse-papiers
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('✅ Lien copié dans le presse-papiers !');
        console.log('✅ Lien copié dans le presse-papiers');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erreur partage:', error);
        // Fallback : Copier le texte
        try {
          await navigator.clipboard.writeText(text);
          alert('✅ Texte copié dans le presse-papiers !');
        } catch (clipboardError) {
          alert('❌ Erreur lors du partage');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <Sidebar />

        <main className="ml-0 flex-1 md:ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen flex-col"
          >
            {/* Barre d'outils - Responsive */}
            <div className="border-b border-gray-200 bg-white px-3 py-3 md:px-6 md:py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Éditeur intelligent</h1>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 md:text-sm">Mode :</span>
                    <select
                      value={mode}
                      onChange={e => setMode(e.target.value as any)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm"
                    >
                      <option value="practice">Entraînement</option>
                      <option value="exam">Examen</option>
                      <option value="creative">Créatif</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2 py-1 text-xs md:gap-2 md:px-3 md:py-2 md:text-sm"
                  >
                    <RotateCcw className="size-3 md:size-4" />
                    <span className="hidden sm:inline">Réinitialiser</span>
                    <span className="sm:hidden">Reset</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-2 py-1 text-xs md:gap-2 md:px-3 md:py-2 md:text-sm"
                  >
                    <Save className="size-3 md:size-4" />
                    <span className="hidden sm:inline">{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    <span className="sm:hidden">Save</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-1 px-2 py-1 text-xs md:gap-2 md:px-3 md:py-2 md:text-sm"
                  >
                    <Download className="size-3 md:size-4" />
                    <span className="hidden lg:inline">Exporter</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShare}
                    className="hidden items-center gap-2 md:flex"
                  >
                    <Share2 className="size-4" />
                    <span className="hidden lg:inline">Partager</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Zone d'édition - Responsive */}
            <div className="flex-1 p-3 md:p-6">
              <div className="mx-auto h-full max-w-6xl">
                <div className="flex h-full flex-col gap-4 lg:grid lg:grid-cols-4 lg:gap-6">
                  {/* Éditeur principal */}
                  <div className="min-h-[400px] flex-1 lg:col-span-3 lg:min-h-0">
                    <SmartEditor
                      initialValue={text}
                      onProgressUpdate={handleProgressUpdate}
                      onChange={(newText) => setText(newText)}
                      mode={mode}
                      realTimeCorrection={true}
                      className="h-full"
                    />
                  </div>

                  {/* Panneau latéral - Collapsible sur mobile */}
                  <div className="lg:space-y-4">
                    {userProgress && (
                      <Card className="p-3 md:p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <User className="size-4 text-blue-600 md:size-5" />
                          <h3 className="text-sm font-semibold text-gray-900 md:text-base">Votre Progression</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:space-y-3 lg:grid-cols-1 lg:gap-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">Niveau</span>
                            <span className="text-sm font-bold text-blue-600 md:text-base">{userProgress.level}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">XP Total</span>
                            <span className="text-sm font-bold text-purple-600 md:text-base">{userProgress.xp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">Mots écrits</span>
                            <span className="text-sm font-bold text-green-600 md:text-base">
                              {userProgress.wordsWritten}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">Exercices</span>
                            <span className="text-sm font-bold text-orange-600 md:text-base">
                              {userProgress.exercisesCompleted}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">Précision</span>
                            <span className="text-sm font-bold text-yellow-600 md:text-base">
                              {Math.round(userProgress.accuracy)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 md:text-sm">Série actuelle</span>
                            <span className="text-sm font-bold text-red-600 md:text-base">
                              {userProgress.currentStreak} jours
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau de métriques - Responsive */}
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 bg-white px-3 py-3 md:px-6 md:py-4"
              >
                <div className="mx-auto max-w-6xl">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 md:text-2xl">{metrics.wordsWritten}</div>
                      <div className="text-xs text-gray-600 md:text-sm">Mots écrits</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600 md:text-2xl">
                        {metrics.errorsDetected}
                      </div>
                      <div className="text-xs text-gray-600 md:text-sm">Erreurs</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 md:text-2xl">
                        {metrics.errorsCorrected}
                      </div>
                      <div className="text-xs text-gray-600 md:text-sm">Corrections</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 md:text-2xl">
                        {metrics.accuracyRate}%
                      </div>
                      <div className="text-xs text-gray-600 md:text-sm">Précision</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600 md:text-2xl">
                        {metrics.streakCount}
                      </div>
                      <div className="text-xs text-gray-600 md:text-sm">Série</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
