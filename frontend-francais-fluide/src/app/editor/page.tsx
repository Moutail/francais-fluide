'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SmartEditor } from '@/components/editor/SmartEditor';
// import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button } from '@/components/ui';
import { Save, Download, Share2, Settings, RotateCcw } from 'lucide-react';
import type { ProgressMetrics } from '@/types';

export default function EditorPage() {
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [mode, setMode] = useState<'practice' | 'exam' | 'creative'>('practice');

  const handleProgressUpdate = (newMetrics: ProgressMetrics) => {
    setMetrics(newMetrics);
  };

  const handleSave = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde du texte:', text);
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
      <Header />
      
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
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
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
                <SmartEditor
                  initialValue={text}
                  onProgressUpdate={handleProgressUpdate}
                  mode={mode}
                  realTimeCorrection={true}
                  className="h-full"
                />
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
