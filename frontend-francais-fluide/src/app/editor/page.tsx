'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmartEditor } from '@/components/editor/SmartEditor';
// import { EditorToolbar } from '@/components/editor/EditorToolbar';
import Navigation from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button } from '@/components/ui';
import { Save, Download, Share2, Settings, RotateCcw, User, Target, Award } from 'lucide-react';
import type { ProgressMetrics } from '@/types';
import { useAuth } from '@/hooks/useApi';

export default function EditorPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam' | 'creative'>('practice');
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProgress();
    }
  }, [isAuthenticated, user]);

  const loadUserProgress = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  const handleProgressUpdate = (newMetrics: ProgressMetrics) => {
    setMetrics(newMetrics);
    
    // Sauvegarder automatiquement la progression
    if (isAuthenticated) {
      saveProgress(newMetrics);
    }
  };

  const saveProgress = async (newMetrics: ProgressMetrics) => {
    try {
      await fetch('http://localhost:3001/api/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          wordsWritten: newMetrics.wordsWritten,
          accuracy: newMetrics.accuracyRate,
          timeSpent: Math.floor(newMetrics.timeSpent || 0),
          exercisesCompleted: newMetrics.exercisesCompleted || 0,
          currentStreak: newMetrics.streakCount
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde progression:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder le texte
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: text,
          mode: mode,
          metrics: metrics
        })
      });

      if (response.ok) {
        console.log('Texte sauvegardé avec succès');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Logique d'export
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mon-texte.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setText('');
    setMetrics(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-screen flex flex-col"
          >
            {/* Barre d'outils */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Éditeur intelligent
                  </h1>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Mode :</span>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="practice">Entraînement</option>
                      <option value="exam">Examen</option>
                      <option value="creative">Créatif</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>

            {/* Zone d'édition */}
            <div className="flex-1 p-6">
              <div className="h-full max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                  {/* Éditeur principal */}
                  <div className="lg:col-span-3">
                    <SmartEditor
                      initialValue={text}
                      onProgressUpdate={handleProgressUpdate}
                      mode={mode}
                      realTimeCorrection={true}
                      className="h-full"
                    />
                  </div>

                  {/* Panneau latéral (progression utilisateur uniquement, données réelles) */}
                  <div className="space-y-4">
                    {userProgress && (
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Votre Progression</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Niveau</span>
                            <span className="font-bold text-blue-600">{userProgress.level}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">XP Total</span>
                            <span className="font-bold text-purple-600">{userProgress.xp}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mots écrits</span>
                            <span className="font-bold text-green-600">{userProgress.wordsWritten}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Exercices</span>
                            <span className="font-bold text-orange-600">{userProgress.exercisesCompleted}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Précision</span>
                            <span className="font-bold text-yellow-600">{Math.round(userProgress.accuracy)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Série actuelle</span>
                            <span className="font-bold text-red-600">{userProgress.currentStreak} jours</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau de métriques */}
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-t border-gray-200 px-6 py-4"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.wordsWritten}
                      </div>
                      <div className="text-sm text-gray-600">Mots écrits</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {metrics.errorsDetected}
                      </div>
                      <div className="text-sm text-gray-600">Erreurs détectées</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.errorsCorrected}
                      </div>
                      <div className="text-sm text-gray-600">Corrections</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.accuracyRate}%
                      </div>
                      <div className="text-sm text-gray-600">Précision</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {metrics.streakCount}
                      </div>
                      <div className="text-sm text-gray-600">Série parfaite</div>
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
