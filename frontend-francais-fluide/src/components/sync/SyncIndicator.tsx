'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { persistenceManager, type SyncStatus } from '@/lib/storage/persistence';

interface SyncIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onSyncNow?: () => void;
}

interface ConflictResolution {
  id: string;
  type: 'content' | 'metadata';
  localValue: any;
  remoteValue: any;
  timestamp: Date;
}

export default function SyncIndicator({
  className = '',
  showDetails = false,
  onSyncNow,
}: SyncIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    error: null,
  });
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Écouter les changements de statut de synchronisation
  useEffect(() => {
    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    persistenceManager.on('status-changed', handleStatusChange);

    // Charger le statut initial
    setSyncStatus(persistenceManager.getSyncStatus());

    return () => {
      persistenceManager.off('status-changed', handleStatusChange);
    };
  }, []);

  // Écouter les changements de connectivité
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Démarrer la synchronisation automatique
      persistenceManager.processSyncQueue();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Forcer la synchronisation
  const handleSyncNow = async () => {
    try {
      await persistenceManager.forceSync();
      onSyncNow?.();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  // Résoudre un conflit
  const resolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));

    if (conflicts.length === 1) {
      setShowConflictModal(false);
    }
  };

  // Obtenir l'icône selon le statut
  const getStatusIcon = () => {
    if (syncStatus.isSyncing) return '🔄';
    if (syncStatus.error) return '❌';
    if (!syncStatus.isOnline) return '📡';
    if (syncStatus.pendingItems > 0) return '⏳';
    if (syncStatus.lastSync) return '✅';
    return '💾';
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = () => {
    if (syncStatus.isSyncing) return 'text-blue-600';
    if (syncStatus.error) return 'text-red-600';
    if (!syncStatus.isOnline) return 'text-gray-500';
    if (syncStatus.pendingItems > 0) return 'text-yellow-600';
    if (syncStatus.lastSync) return 'text-green-600';
    return 'text-gray-400';
  };

  // Obtenir le texte de statut
  const getStatusText = () => {
    if (syncStatus.isSyncing) return 'Synchronisation...';
    if (syncStatus.error) return 'Erreur de sync';
    if (!syncStatus.isOnline) return 'Hors ligne';
    if (syncStatus.pendingItems > 0) return `${syncStatus.pendingItems} en attente`;
    if (syncStatus.lastSync) {
      const timeAgo = Math.floor((Date.now() - syncStatus.lastSync.getTime()) / 1000);
      if (timeAgo < 60) return "Synchronisé à l'instant";
      if (timeAgo < 3600) return `Synchronisé il y a ${Math.floor(timeAgo / 60)}min`;
      return `Synchronisé il y a ${Math.floor(timeAgo / 3600)}h`;
    }
    return 'Non synchronisé';
  };

  // Animation de rotation pour l'icône de synchronisation
  const rotationVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Indicateur principal */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`text-lg ${getStatusColor()}`}
            variants={syncStatus.isSyncing ? rotationVariants : {}}
            animate={syncStatus.isSyncing ? 'animate' : 'initial'}
          >
            {getStatusIcon()}
          </motion.div>

          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>

        {/* Badge pour les éléments en attente */}
        {syncStatus.pendingItems > 0 && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {syncStatus.pendingItems}
          </Badge>
        )}

        {/* Bouton de synchronisation manuelle */}
        {syncStatus.isOnline && !syncStatus.isSyncing && (
          <Button onClick={handleSyncNow} size="sm" variant="outline" className="h-6 px-2 text-xs">
            Sync
          </Button>
        )}

        {/* Bouton de détails */}
        {showDetails && (
          <Button
            onClick={() => setShowConflictModal(true)}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
          >
            Détails
          </Button>
        )}
      </div>

      {/* Modal de détails et résolution de conflits */}
      <AnimatePresence>
        {showConflictModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowConflictModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">État de Synchronisation</h3>
                <Button onClick={() => setShowConflictModal(false)} variant="ghost" size="sm">
                  ✕
                </Button>
              </div>

              {/* Statut détaillé */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Connexion</label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-2 rounded-full ${
                          syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm">
                        {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Synchronisation</label>
                    <div className="text-sm">
                      {syncStatus.isSyncing ? 'En cours...' : 'Arrêtée'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Dernière sync</label>
                    <div className="text-sm">
                      {syncStatus.lastSync ? syncStatus.lastSync.toLocaleString() : 'Jamais'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">En attente</label>
                    <div className="text-sm">{syncStatus.pendingItems} élément(s)</div>
                  </div>
                </div>

                {/* Erreur de synchronisation */}
                {syncStatus.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">❌</span>
                      <span className="text-sm font-medium text-red-800">Erreur</span>
                    </div>
                    <p className="mt-1 text-sm text-red-700">{syncStatus.error}</p>
                  </div>
                )}
              </div>

              {/* Conflits de synchronisation */}
              {conflicts.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 font-semibold text-gray-900">Conflits à résoudre</h4>
                  <div className="space-y-3">
                    {conflicts.map(conflict => (
                      <Card key={conflict.id} className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">Conflit {conflict.type}</span>
                          <span className="text-xs text-gray-500">
                            {conflict.timestamp.toLocaleString()}
                          </span>
                        </div>

                        <div className="mb-3 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600">
                              Version locale
                            </label>
                            <div className="rounded bg-blue-50 p-2 text-sm">
                              {typeof conflict.localValue === 'string'
                                ? conflict.localValue
                                : JSON.stringify(conflict.localValue)}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">
                              Version distante
                            </label>
                            <div className="rounded bg-green-50 p-2 text-sm">
                              {typeof conflict.remoteValue === 'string'
                                ? conflict.remoteValue
                                : JSON.stringify(conflict.remoteValue)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => resolveConflict(conflict.id, 'local')}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Garder local
                          </Button>
                          <Button
                            onClick={() => resolveConflict(conflict.id, 'remote')}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Prendre distant
                          </Button>
                          <Button
                            onClick={() => resolveConflict(conflict.id, 'merge')}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Fusionner
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowConflictModal(false)} variant="outline" size="sm">
                  Fermer
                </Button>
                <Button
                  onClick={handleSyncNow}
                  disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                  size="sm"
                >
                  Synchroniser maintenant
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
