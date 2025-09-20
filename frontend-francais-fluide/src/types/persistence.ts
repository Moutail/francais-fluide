// Types pour la persistance et synchronisation

export interface PersistedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  version: number;
  isDirty: boolean;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
  language: string;
  author: string;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  collaborators?: string[];
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  documentId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  error: string | null;
  syncProgress?: number;
}

export interface ConflictResolution {
  id: string;
  type: 'content' | 'metadata' | 'permissions';
  localValue: any;
  remoteValue: any;
  timestamp: Date;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface CacheInfo {
  name: string;
  size: number;
  lastUpdated: Date;
  entries: number;
}

export interface OfflineData {
  documents: PersistedDocument[];
  syncQueue: SyncQueueItem[];
  settings: Record<string, any>;
  lastSync: Date | null;
}

export interface AutoSaveConfig {
  enabled: boolean;
  debounceMs: number;
  saveIntervalMs: number;
  maxRetries: number;
  compressionEnabled: boolean;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  conflictResolution: 'local' | 'remote' | 'prompt';
  maxQueueSize: number;
  retryDelay: number;
}

export interface StorageStats {
  totalSize: number;
  documentCount: number;
  syncQueueSize: number;
  cacheSize: number;
  lastCleanup: Date | null;
}

export interface BackupData {
  version: string;
  timestamp: Date;
  documents: PersistedDocument[];
  settings: Record<string, any>;
  metadata: {
    appVersion: string;
    userAgent: string;
    platform: string;
  };
}

export interface RestoreOptions {
  overwriteExisting: boolean;
  mergeConflicts: boolean;
  validateData: boolean;
  createBackup: boolean;
}

export interface SyncEvent {
  type: 'started' | 'completed' | 'failed' | 'conflict' | 'progress';
  data?: any;
  timestamp: Date;
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
}

export interface PersistenceError extends Error {
  code: 'STORAGE_FULL' | 'SYNC_FAILED' | 'CONFLICT' | 'NETWORK_ERROR' | 'PERMISSION_DENIED';
  retryable: boolean;
  context?: any;
}
