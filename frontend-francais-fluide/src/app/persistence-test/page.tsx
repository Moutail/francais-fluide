'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import SyncIndicator from '@/components/sync/SyncIndicator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { persistenceManager } from '@/lib/storage/persistence';
import type { PersistedDocument, SyncStatus, StorageStats } from '@/types';

// Désactiver le SSG pour cette page de test (accès à indexedDB/window requis)
export const dynamic = 'force-dynamic';

export default function PersistenceTestPage() {
  const [documents, setDocuments] = useState<PersistedDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState({
    id: 'test-doc-1',
    title: 'Document de Test',
    content: 'Ceci est un document de test pour la persistance...',
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    // Use safe default for SSR; update in useEffect on client
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    error: null,
  });
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  // Hook de sauvegarde automatique
  const {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveStatus,
    error: saveError,
    saveNow,
    forceSave,
  } = useAutoSave({
    documentId: currentDocument.id,
    title: currentDocument.title,
    content: currentDocument.content,
    enabled: true,
    debounceMs: 2000,
    saveIntervalMs: 30000,
    onSave: doc => {
      console.log('Document sauvegardé:', doc);
      loadDocuments();
    },
    onError: error => {
      console.error('Erreur de sauvegarde:', error);
    },
  });

  // Charger les documents
  const loadDocuments = async () => {
    try {
      const docs = await persistenceManager.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  };

  // Charger les statistiques de stockage
  const loadStorageStats = async () => {
    try {
      // Simulation des statistiques
      const stats: StorageStats = {
        totalSize: 1024 * 1024, // 1MB
        documentCount: documents.length,
        syncQueueSize: syncStatus.pendingItems,
        cacheSize: 512 * 1024, // 512KB
        lastCleanup: new Date(),
      };
      setStorageStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Écouter les changements de statut de synchronisation
  useEffect(() => {
    // Update isOnline on client to avoid SSR navigator access
    if (typeof navigator !== 'undefined') {
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    }

    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    persistenceManager.on('status-changed', handleStatusChange);
    setSyncStatus(persistenceManager.getSyncStatus());

    return () => {
      persistenceManager.off('status-changed', handleStatusChange);
    };
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadDocuments();
    loadStorageStats();
  }, []);

  // Mettre à jour les statistiques quand les documents changent
  useEffect(() => {
    loadStorageStats();
  }, [documents, syncStatus.pendingItems]);

  // Créer un nouveau document
  const createNewDocument = () => {
    const newDoc = {
      id: `test-doc-${Date.now()}`,
      title: 'Nouveau Document',
      content: 'Contenu du nouveau document...',
    };
    setCurrentDocument(newDoc);
  };

  // Supprimer un document
  const deleteDocument = async (docId: string) => {
    try {
      await persistenceManager.deleteDocument(docId);
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Forcer la synchronisation
  const handleForceSync = async () => {
    try {
      await persistenceManager.forceSync();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  // Nettoyer le cache
  const clearCache = async () => {
    try {
      await persistenceManager.clearAllData();
      loadDocuments();
      loadStorageStats();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Test de Persistance et Synchronisation
          </h1>
          <p className="text-lg text-gray-600">
            Testez le système de sauvegarde automatique et de synchronisation
          </p>
        </div>

        {/* Indicateur de synchronisation */}
        <Card className="mb-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">État de Synchronisation</h2>
            <SyncIndicator showDetails={true} onSyncNow={handleForceSync} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStatus.pendingItems}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {storageStats ? Math.round(storageStats.totalSize / 1024) : 0} KB
              </div>
              <div className="text-sm text-gray-600">Taille totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {syncStatus.isOnline ? '🟢' : '🔴'}
              </div>
              <div className="text-sm text-gray-600">
                {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Éditeur de document */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Éditeur de Document</h3>
              <div className="flex items-center gap-2">
                <Badge variant={hasUnsavedChanges ? 'error' : 'success'}>
                  {hasUnsavedChanges ? 'Non sauvegardé' : 'Sauvegardé'}
                </Badge>
                <Badge variant={isSaving ? 'default' : 'secondary'}>
                  {isSaving ? 'Sauvegarde...' : 'Inactif'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  value={currentDocument.title}
                  onChange={e =>
                    setCurrentDocument(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Contenu</label>
                <textarea
                  value={currentDocument.content}
                  onChange={e =>
                    setCurrentDocument(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tapez votre contenu ici... La sauvegarde se fait automatiquement."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveNow} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
                </Button>
                <Button onClick={forceSave} variant="outline">
                  Forcer la sauvegarde
                </Button>
                <Button onClick={createNewDocument} variant="outline">
                  Nouveau document
                </Button>
              </div>

              {lastSaved && (
                <div className="text-sm text-gray-500">
                  Dernière sauvegarde: {lastSaved.toLocaleString()}
                </div>
              )}

              {saveError && (
                <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                  Erreur: {saveError}
                </div>
              )}
            </div>
          </Card>

          {/* Liste des documents */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documents Sauvegardés</h3>
              <Button onClick={loadDocuments} variant="outline" size="sm">
                Actualiser
              </Button>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="py-8 text-center text-gray-500">Aucun document sauvegardé</div>
              ) : (
                documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{doc.title}</div>
                      <div className="text-sm text-gray-500">
                        {doc.metadata.wordCount} mots • {doc.metadata.characterCount} caractères
                      </div>
                      <div className="text-xs text-gray-400">
                        Modifié: {doc.lastModified.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setCurrentDocument({
                            id: doc.id,
                            title: doc.title,
                            content: doc.content,
                          })
                        }
                        size="sm"
                        variant="outline"
                      >
                        Ouvrir
                      </Button>
                      <Button
                        onClick={() => deleteDocument(doc.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        {storageStats && (
          <Card className="mt-8 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistiques de Stockage</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div className="mb-2 text-sm font-medium text-gray-600">Taille totale</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(storageStats.totalSize / 1024)} KB
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-gray-600">Cache</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(storageStats.cacheSize / 1024)} KB
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-gray-600">Dernier nettoyage</div>
                <div className="text-sm text-gray-900">
                  {storageStats.lastCleanup?.toLocaleString() || 'Jamais'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions de test */}
        <Card className="mt-8 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions de Test</h3>

          <div className="flex flex-wrap gap-4">
            <Button onClick={handleForceSync} variant="outline">
              🔄 Forcer la synchronisation
            </Button>
            <Button onClick={loadDocuments} variant="outline">
              📄 Recharger les documents
            </Button>
            <Button onClick={loadStorageStats} variant="outline">
              📊 Actualiser les statistiques
            </Button>
            <Button onClick={clearCache} variant="outline" className="text-red-600">
              🗑️ Nettoyer le cache
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-yellow-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-yellow-900">📋 Instructions de Test</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>
              1. <strong>Modifiez le titre ou le contenu</strong> et observez la sauvegarde
              automatique
            </p>
            <p>
              2. <strong>Testez le mode hors ligne</strong> en désactivant votre connexion
            </p>
            <p>
              3. <strong>Créez plusieurs documents</strong> pour tester la persistance
            </p>
            <p>
              4. <strong>Observez l'indicateur de synchronisation</strong> en temps réel
            </p>
            <p>
              5. <strong>Testez la compression</strong> avec du contenu long
            </p>
            <p>
              6. <strong>Vérifiez la queue de synchronisation</strong> en mode hors ligne
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
