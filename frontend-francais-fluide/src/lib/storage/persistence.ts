import LZString from 'lz-string';

// Types pour la persistance
export interface PersistedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  version: number;
  isDirty: boolean;
  metadata: {
    wordCount: number;
    characterCount: number;
    language: string;
    author: string;
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  documentId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  error: string | null;
}

// Configuration de la base de données
const DB_NAME = 'FrancaisFluideDB';
const DB_VERSION = 1;
const DOCUMENTS_STORE = 'documents';
const SYNC_QUEUE_STORE = 'syncQueue';
const SETTINGS_STORE = 'settings';

// Gestionnaire de persistance
export class PersistenceManager {
  private db: IDBDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    error: null
  };
  private listeners: Map<string, Array<(data?: unknown) => void>> = new Map();

  constructor() {
    this.initializeDatabase();
    this.setupOnlineOfflineListeners();
  }

  // Initialiser la base de données IndexedDB
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture de la base de données:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Base de données IndexedDB initialisée');
        this.loadSyncQueue();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les documents
        if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
          const documentsStore = db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
          documentsStore.createIndex('lastModified', 'lastModified', { unique: false });
          documentsStore.createIndex('title', 'title', { unique: false });
        }

        // Store pour la queue de synchronisation
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const syncQueueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncQueueStore.createIndex('documentId', 'documentId', { unique: false });
        }

        // Store pour les paramètres
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  // Configurer les écouteurs online/offline
  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.emit('status-changed', this.syncStatus);
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.emit('status-changed', this.syncStatus);
    });
  }

  // Compresser les données avec LZ-string
  private compressData(data: any): string {
    const jsonString = JSON.stringify(data);
    return LZString.compress(jsonString);
  }

  // Décompresser les données
  private decompressData(compressedData: string): any {
    const jsonString = LZString.decompress(compressedData);
    return jsonString ? JSON.parse(jsonString) : null;
  }

  // Sauvegarder un document
  async saveDocument(document: Omit<PersistedDocument, 'version' | 'isDirty'>): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const compressedContent = this.compressData(document.content);
    const persistedDocument: PersistedDocument = {
      ...document,
      content: compressedContent,
      version: await this.getNextVersion(document.id),
      isDirty: true,
      lastModified: new Date()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.put(persistedDocument);

      request.onsuccess = () => {
        this.addToSyncQueue('update', document.id, persistedDocument);
        this.emit('document-saved', persistedDocument);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Charger un document
  async loadDocument(documentId: string): Promise<PersistedDocument | null> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readonly');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.get(documentId);

      request.onsuccess = () => {
        const document = request.result;
        if (document) {
          // Décompresser le contenu
          document.content = this.decompressData(document.content);
          resolve(document);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Lister tous les documents
  async listDocuments(): Promise<PersistedDocument[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readonly');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const documents = request.result.map(doc => ({
          ...doc,
          content: this.decompressData(doc.content)
        }));
        resolve(documents);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Supprimer un document
  async deleteDocument(documentId: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.delete(documentId);

      request.onsuccess = () => {
        this.addToSyncQueue('delete', documentId, null);
        this.emit('document-deleted', documentId);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Obtenir la version suivante d'un document
  private async getNextVersion(documentId: string): Promise<number> {
    const document = await this.loadDocument(documentId);
    return document ? document.version + 1 : 1;
  }

  // Ajouter un élément à la queue de synchronisation
  private addToSyncQueue(type: 'create' | 'update' | 'delete', documentId: string, data: any): void {
    const queueItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      documentId,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.syncQueue.push(queueItem);
    this.syncStatus.pendingItems = this.syncQueue.length;
    this.emit('status-changed', this.syncStatus);
    this.saveSyncQueue();
  }

  // Sauvegarder la queue de synchronisation
  private async saveSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      
      // Vider la store
      store.clear();
      
      // Ajouter tous les éléments
      this.syncQueue.forEach(item => {
        store.add(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Charger la queue de synchronisation
  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SYNC_QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        this.syncQueue = request.result;
        this.syncStatus.pendingItems = this.syncQueue.length;
        this.emit('status-changed', this.syncStatus);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Traiter la queue de synchronisation
  async processSyncQueue(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.emit('status-changed', this.syncStatus);

    try {
      const itemsToProcess = [...this.syncQueue];
      
      for (const item of itemsToProcess) {
        try {
          await this.syncItem(item);
          this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Erreur lors de la synchronisation:', error);
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            this.removeFromSyncQueue(item.id);
            this.syncStatus.error = `Échec de synchronisation après ${item.maxRetries} tentatives`;
          }
        }
      }

      this.syncStatus.lastSync = new Date();
      this.syncStatus.error = null;
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : 'Erreur de synchronisation';
    } finally {
      this.syncStatus.isSyncing = false;
      this.emit('status-changed', this.syncStatus);
    }
  }

  // Synchroniser un élément individuel
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Simulation de l'API de synchronisation
    // En production, remplacer par l'appel API réel
    const apiEndpoint = '/api/sync';
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: item.type,
        documentId: item.documentId,
        data: item.data,
        timestamp: item.timestamp
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
  }

  // Supprimer un élément de la queue
  private removeFromSyncQueue(itemId: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
    this.syncStatus.pendingItems = this.syncQueue.length;
    this.saveSyncQueue();
  }

  // Sauvegarder les paramètres
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Charger un paramètre
  async loadSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Obtenir le statut de synchronisation
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Forcer la synchronisation
  async forceSync(): Promise<void> {
    await this.processSyncQueue();
  }

  // Nettoyer la base de données
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DOCUMENTS_STORE, SYNC_QUEUE_STORE, SETTINGS_STORE], 'readwrite');
      
      transaction.objectStore(DOCUMENTS_STORE).clear();
      transaction.objectStore(SYNC_QUEUE_STORE).clear();
      transaction.objectStore(SETTINGS_STORE).clear();

      transaction.oncomplete = () => {
        this.syncQueue = [];
        this.syncStatus.pendingItems = 0;
        this.emit('status-changed', this.syncStatus);
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  // Gestion des écouteurs d'événements
  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Instance globale
export const persistenceManager = new PersistenceManager();
