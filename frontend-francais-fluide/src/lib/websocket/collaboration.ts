import { io, Socket } from 'socket.io-client';
import type { UserProfile } from '@/types';

// Types pour la collaboration
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isTyping: boolean;
  lastSeen: Date;
  cursor?: CursorPosition;
  selection?: TextSelection;
}

export interface CursorPosition {
  line: number;
  column: number;
  timestamp: number;
}

export interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
  text: string;
  timestamp: number;
}

export interface CollaborationRoom {
  id: string;
  name: string;
  documentId: string;
  users: CollaborationUser[];
  content: string;
  lastModified: Date;
  isLocked: boolean;
  lockOwner?: string;
}

export interface CollaborationMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'action';
}

export interface DocumentOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  length: number;
  text: string;
  userId: string;
  timestamp: number;
  version: number;
}

// CRDT simplifié pour la résolution de conflits
export class SimpleCRDT {
  private operations: DocumentOperation[] = [];
  private version = 0;

  // Appliquer une opération
  applyOperation(operation: DocumentOperation): boolean {
    // Vérifier la version pour éviter les conflits
    if (operation.version <= this.version) {
      return false;
    }

    // Appliquer l'opération en résolvant les conflits
    this.resolveConflicts(operation);
    this.operations.push(operation);
    this.version = operation.version;
    return true;
  }

  // Résoudre les conflits entre opérations
  private resolveConflicts(newOp: DocumentOperation) {
    const conflictingOps = this.operations.filter(
      op =>
        op.timestamp > newOp.timestamp - 1000 && // Dans la dernière seconde
        this.operationsOverlap(op, newOp)
    );

    for (const conflictOp of conflictingOps) {
      this.adjustOperationForConflict(conflictOp, newOp);
    }
  }

  // Vérifier si deux opérations se chevauchent
  private operationsOverlap(op1: DocumentOperation, op2: DocumentOperation): boolean {
    const op1End = op1.position + op1.length;
    const op2End = op2.position + op2.length;

    return !(op1End <= op2.position || op2End <= op1.position);
  }

  // Ajuster une opération pour résoudre un conflit
  private adjustOperationForConflict(existingOp: DocumentOperation, newOp: DocumentOperation) {
    if (newOp.type === 'insert' && existingOp.type === 'insert') {
      // Si les deux sont des insertions, ajuster la position
      if (newOp.position <= existingOp.position) {
        existingOp.position += newOp.text.length;
      }
    } else if (newOp.type === 'delete' && existingOp.type === 'insert') {
      // Si nouvelle opération est une suppression et l'existante une insertion
      if (newOp.position < existingOp.position) {
        existingOp.position = Math.max(0, existingOp.position - newOp.length);
      }
    }
  }

  // Obtenir le contenu final du document
  getContent(): string {
    let content = '';
    const sortedOps = [...this.operations].sort((a, b) => a.timestamp - b.timestamp);

    for (const op of sortedOps) {
      switch (op.type) {
        case 'insert':
          content = content.slice(0, op.position) + op.text + content.slice(op.position);
          break;
        case 'delete':
          content = content.slice(0, op.position) + content.slice(op.position + op.length);
          break;
        case 'replace':
          content =
            content.slice(0, op.position) + op.text + content.slice(op.position + op.length);
          break;
      }
    }

    return content;
  }

  // Obtenir la version actuelle
  getVersion(): number {
    return this.version;
  }
}

// Gestionnaire de collaboration
export class CollaborationManager {
  private socket: Socket | null = null;
  private currentRoom: CollaborationRoom | null = null;
  private currentUser: CollaborationUser | null = null;
  private crdt: SimpleCRDT = new SimpleCRDT();
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeSocket();
  }

  // Initialiser la connexion WebSocket
  private initializeSocket() {
    // Simulation du serveur - en production, remplacer par l'URL réelle
    // Pour les tests, on simule la connexion sans serveur réel
    this.socket = null; // Désactiver la connexion réelle pour les tests

    // En production, décommenter :
    // this.socket = io('ws://localhost:3001', {
    //   transports: ['websocket'],
    //   autoConnect: false
    // });

    this.setupEventListeners();
  }

  // Configurer les écouteurs d'événements
  private setupEventListeners() {
    // Simulation des événements pour les tests
    if (!this.socket) {
      // Simuler la connexion immédiate pour les tests
      setTimeout(() => {
        this.emit('connected');
      }, 100);
      return;
    }

    // Connexion établie
    this.socket.on('connect', () => {
      console.log('Connexion WebSocket établie');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    // Déconnexion
    this.socket.on('disconnect', () => {
      console.log('Connexion WebSocket fermée');
      this.emit('disconnected');
      this.handleReconnection();
    });

    // Erreur de connexion
    this.socket.on('connect_error', error => {
      console.error('Erreur de connexion WebSocket:', error);
      this.emit('error', error);
      this.handleReconnection();
    });

    // Événements de collaboration
    this.socket.on('room-joined', (room: CollaborationRoom) => {
      this.currentRoom = room;
      this.emit('room-joined', room);
    });

    this.socket.on('user-joined', (user: CollaborationUser) => {
      if (this.currentRoom) {
        this.currentRoom.users.push(user);
        this.emit('user-joined', user);
      }
    });

    this.socket.on('user-left', (userId: string) => {
      if (this.currentRoom) {
        this.currentRoom.users = this.currentRoom.users.filter(u => u.id !== userId);
        this.emit('user-left', userId);
      }
    });

    this.socket.on('cursor-moved', (data: { userId: string; cursor: CursorPosition }) => {
      this.updateUserCursor(data.userId, data.cursor);
      this.emit('cursor-moved', data);
    });

    this.socket.on('text-selected', (data: { userId: string; selection: TextSelection }) => {
      this.updateUserSelection(data.userId, data.selection);
      this.emit('text-selected', data);
    });

    this.socket.on('typing-started', (userId: string) => {
      this.updateUserTyping(userId, true);
      this.emit('typing-started', userId);
    });

    this.socket.on('typing-stopped', (userId: string) => {
      this.updateUserTyping(userId, false);
      this.emit('typing-stopped', userId);
    });

    this.socket.on('document-changed', (operation: DocumentOperation) => {
      if (this.crdt.applyOperation(operation)) {
        this.emit('document-changed', operation);
      }
    });

    this.socket.on('message-received', (message: CollaborationMessage) => {
      this.emit('message-received', message);
    });

    this.socket.on('room-locked', (data: { isLocked: boolean; lockOwner?: string }) => {
      if (this.currentRoom) {
        this.currentRoom.isLocked = data.isLocked;
        this.currentRoom.lockOwner = data.lockOwner;
        this.emit('room-locked', data);
      }
    });
  }

  // Gérer la reconnexion automatique
  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(
          `Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
        );
        this.socket?.connect();
      }, delay);
    } else {
      this.emit('reconnection-failed');
    }
  }

  // Se connecter
  connect(userProfile: UserProfile) {
    if (!this.socket) {
      this.initializeSocket();
    }

    this.currentUser = {
      id: userProfile.id,
      name: userProfile.name,
      color: this.generateUserColor(),
      isTyping: false,
      lastSeen: new Date(),
    };

    this.socket?.connect();
  }

  // Se déconnecter
  disconnect() {
    if (this.currentRoom) {
      this.leaveRoom();
    }
    this.socket?.disconnect();
    this.currentUser = null;
    this.currentRoom = null;
  }

  // Rejoindre une room
  joinRoom(roomId: string, documentId: string) {
    if (!this.socket || !this.currentUser) return;

    this.socket.emit('join-room', {
      roomId,
      documentId,
      user: this.currentUser,
    });
  }

  // Quitter la room
  leaveRoom() {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('leave-room', {
      roomId: this.currentRoom.id,
      userId: this.currentUser?.id,
    });

    this.currentRoom = null;
  }

  // Envoyer une opération de document
  sendDocumentOperation(operation: Omit<DocumentOperation, 'userId' | 'timestamp' | 'version'>) {
    if (!this.socket || !this.currentUser) return;

    const fullOperation: DocumentOperation = {
      ...operation,
      userId: this.currentUser.id,
      timestamp: Date.now(),
      version: this.crdt.getVersion() + 1,
    };

    this.socket.emit('document-operation', fullOperation);
  }

  // Envoyer la position du curseur
  sendCursorPosition(cursor: CursorPosition) {
    if (!this.socket || !this.currentUser) return;

    this.socket.emit('cursor-moved', {
      userId: this.currentUser.id,
      cursor,
    });
  }

  // Envoyer la sélection de texte
  sendTextSelection(selection: TextSelection) {
    if (!this.socket || !this.currentUser) return;

    this.socket.emit('text-selected', {
      userId: this.currentUser.id,
      selection,
    });
  }

  // Indiquer que l'utilisateur tape
  sendTypingStarted() {
    if (!this.socket || !this.currentUser) return;

    this.socket.emit('typing-started', this.currentUser.id);
  }

  // Indiquer que l'utilisateur a arrêté de taper
  sendTypingStopped() {
    if (!this.socket || !this.currentUser) return;

    this.socket.emit('typing-stopped', this.currentUser.id);
  }

  // Envoyer un message de chat
  sendMessage(content: string) {
    if (!this.socket || !this.currentUser || !this.currentRoom) return;

    const message: CollaborationMessage = {
      id: `msg-${Date.now()}`,
      roomId: this.currentRoom.id,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      content,
      timestamp: new Date(),
      type: 'message',
    };

    this.socket.emit('send-message', message);
  }

  // Verrouiller/déverrouiller la room
  toggleRoomLock() {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('toggle-room-lock', {
      roomId: this.currentRoom.id,
      userId: this.currentUser?.id,
    });
  }

  // Mettre à jour le curseur d'un utilisateur
  private updateUserCursor(userId: string, cursor: CursorPosition) {
    if (!this.currentRoom) return;

    const user = this.currentRoom.users.find(u => u.id === userId);
    if (user) {
      user.cursor = cursor;
      user.lastSeen = new Date();
    }
  }

  // Mettre à jour la sélection d'un utilisateur
  private updateUserSelection(userId: string, selection: TextSelection) {
    if (!this.currentRoom) return;

    const user = this.currentRoom.users.find(u => u.id === userId);
    if (user) {
      user.selection = selection;
      user.lastSeen = new Date();
    }
  }

  // Mettre à jour l'état de frappe d'un utilisateur
  private updateUserTyping(userId: string, isTyping: boolean) {
    if (!this.currentRoom) return;

    const user = this.currentRoom.users.find(u => u.id === userId);
    if (user) {
      user.isTyping = isTyping;
      user.lastSeen = new Date();
    }
  }

  // Générer une couleur pour l'utilisateur
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Gestion des écouteurs d'événements
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get room(): CollaborationRoom | null {
    return this.currentRoom;
  }

  get user(): CollaborationUser | null {
    return this.currentUser;
  }

  get documentContent(): string {
    return this.crdt.getContent();
  }
}

// Instance globale
export const collaborationManager = new CollaborationManager();
