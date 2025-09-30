import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collaborationManager,
  type CollaborationRoom,
  type CollaborationUser,
  type CollaborationMessage,
  type CursorPosition,
  type TextSelection,
} from '@/lib/websocket/collaboration';
import type { UserProfile } from '@/types';

interface UseCollaborationOptions {
  userProfile: UserProfile;
  roomId?: string;
  documentId?: string;
  autoConnect?: boolean;
}

interface UseCollaborationReturn {
  // État de connexion
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Room et utilisateurs
  currentRoom: CollaborationRoom | null;
  users: CollaborationUser[];
  currentUser: CollaborationUser | null;

  // Messages de chat
  messages: CollaborationMessage[];

  // Actions
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string, documentId: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string) => void;
  sendCursorPosition: (cursor: CursorPosition) => void;
  sendTextSelection: (selection: TextSelection) => void;
  sendTypingStarted: () => void;
  sendTypingStopped: () => void;
  toggleRoomLock: () => void;

  // État de frappe
  typingUsers: string[];

  // Document
  documentContent: string;
  updateDocumentContent: (content: string) => void;
}

export function useCollaboration({
  userProfile,
  roomId,
  documentId,
  autoConnect = true,
}: UseCollaborationOptions): UseCollaborationReturn {
  // État de connexion
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Room et utilisateurs
  const [currentRoom, setCurrentRoom] = useState<CollaborationRoom | null>(null);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);

  // Messages de chat
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);

  // État de frappe
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Document
  const [documentContent, setDocumentContent] = useState('');

  // Refs pour éviter les re-renders inutiles
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorPositionRef = useRef<CursorPosition | null>(null);

  // Connexion
  const connect = useCallback(() => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      collaborationManager.connect(userProfile);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Erreur de connexion');
      setIsConnecting(false);
    }
  }, [userProfile, isConnecting, isConnected]);

  // Déconnexion
  const disconnect = useCallback(() => {
    collaborationManager.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setCurrentRoom(null);
    setUsers([]);
    setCurrentUser(null);
    setMessages([]);
    setTypingUsers([]);
    setDocumentContent('');
  }, []);

  // Rejoindre une room
  const joinRoom = useCallback(
    (newRoomId: string, newDocumentId: string) => {
      if (!isConnected) {
        console.warn('Pas connecté au serveur WebSocket');
        return;
      }

      collaborationManager.joinRoom(newRoomId, newDocumentId);
    },
    [isConnected]
  );

  // Quitter la room
  const leaveRoom = useCallback(() => {
    collaborationManager.leaveRoom();
  }, []);

  // Envoyer un message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    collaborationManager.sendMessage(content);
  }, []);

  // Envoyer la position du curseur
  const sendCursorPosition = useCallback((cursor: CursorPosition) => {
    // Éviter d'envoyer trop souvent la même position
    if (
      lastCursorPositionRef.current &&
      lastCursorPositionRef.current.line === cursor.line &&
      lastCursorPositionRef.current.column === cursor.column
    ) {
      return;
    }

    lastCursorPositionRef.current = cursor;
    collaborationManager.sendCursorPosition(cursor);
  }, []);

  // Envoyer la sélection de texte
  const sendTextSelection = useCallback((selection: TextSelection) => {
    collaborationManager.sendTextSelection(selection);
  }, []);

  // Indiquer que l'utilisateur tape
  const sendTypingStarted = useCallback(() => {
    collaborationManager.sendTypingStarted();

    // Arrêter l'indication de frappe après 2 secondes d'inactivité
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      collaborationManager.sendTypingStopped();
    }, 2000);
  }, []);

  // Indiquer que l'utilisateur a arrêté de taper
  const sendTypingStopped = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    collaborationManager.sendTypingStopped();
  }, []);

  // Verrouiller/déverrouiller la room
  const toggleRoomLock = useCallback(() => {
    collaborationManager.toggleRoomLock();
  }, []);

  // Mettre à jour le contenu du document
  const updateDocumentContent = useCallback((content: string) => {
    setDocumentContent(content);
  }, []);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setCurrentUser(collaborationManager.user);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (error: any) => {
      setConnectionError(error.message || 'Erreur de connexion');
      setIsConnecting(false);
    };

    const handleRoomJoined = (room: CollaborationRoom) => {
      setCurrentRoom(room);
      setUsers(room.users);
    };

    const handleUserJoined = (user: CollaborationUser) => {
      setUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.map(u => (u.id === user.id ? user : u));
        }
        return [...prev, user];
      });
    };

    const handleUserLeft = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    const handleCursorMoved = (data: { userId: string; cursor: CursorPosition }) => {
      setUsers(prev =>
        prev.map(user =>
          user.id === data.userId ? { ...user, cursor: data.cursor, lastSeen: new Date() } : user
        )
      );
    };

    const handleTextSelected = (data: { userId: string; selection: TextSelection }) => {
      setUsers(prev =>
        prev.map(user =>
          user.id === data.userId
            ? { ...user, selection: data.selection, lastSeen: new Date() }
            : user
        )
      );
    };

    const handleTypingStarted = (userId: string) => {
      setTypingUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    };

    const handleTypingStopped = (userId: string) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    const handleDocumentChanged = (operation: any) => {
      // Mettre à jour le contenu du document
      const newContent = collaborationManager.documentContent;
      setDocumentContent(newContent);
    };

    const handleMessageReceived = (message: CollaborationMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleRoomLocked = (data: { isLocked: boolean; lockOwner?: string }) => {
      setCurrentRoom(prev =>
        prev
          ? {
              ...prev,
              isLocked: data.isLocked,
              lockOwner: data.lockOwner,
            }
          : null
      );
    };

    const handleReconnectionFailed = () => {
      setConnectionError('Impossible de se reconnecter au serveur');
      setIsConnecting(false);
    };

    // Enregistrer les écouteurs
    collaborationManager.on('connected', handleConnected);
    collaborationManager.on('disconnected', handleDisconnected);
    collaborationManager.on('error', handleError);
    collaborationManager.on('room-joined', handleRoomJoined);
    collaborationManager.on('user-joined', handleUserJoined);
    collaborationManager.on('user-left', handleUserLeft);
    collaborationManager.on('cursor-moved', handleCursorMoved);
    collaborationManager.on('text-selected', handleTextSelected);
    collaborationManager.on('typing-started', handleTypingStarted);
    collaborationManager.on('typing-stopped', handleTypingStopped);
    collaborationManager.on('document-changed', handleDocumentChanged);
    collaborationManager.on('message-received', handleMessageReceived);
    collaborationManager.on('room-locked', handleRoomLocked);
    collaborationManager.on('reconnection-failed', handleReconnectionFailed);

    // Nettoyage
    return () => {
      collaborationManager.off('connected', handleConnected);
      collaborationManager.off('disconnected', handleDisconnected);
      collaborationManager.off('error', handleError);
      collaborationManager.off('room-joined', handleRoomJoined);
      collaborationManager.off('user-joined', handleUserJoined);
      collaborationManager.off('user-left', handleUserLeft);
      collaborationManager.off('cursor-moved', handleCursorMoved);
      collaborationManager.off('text-selected', handleTextSelected);
      collaborationManager.off('typing-started', handleTypingStarted);
      collaborationManager.off('typing-stopped', handleTypingStopped);
      collaborationManager.off('document-changed', handleDocumentChanged);
      collaborationManager.off('message-received', handleMessageReceived);
      collaborationManager.off('room-locked', handleRoomLocked);
      collaborationManager.off('reconnection-failed', handleReconnectionFailed);
    };
  }, []);

  // Connexion automatique
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, isConnected, isConnecting, connect]);

  // Rejoindre la room automatiquement si fournie
  useEffect(() => {
    if (isConnected && roomId && documentId && !currentRoom) {
      joinRoom(roomId, documentId);
    }
  }, [isConnected, roomId, documentId, currentRoom, joinRoom]);

  // Nettoyage à la déconnexion
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // État de connexion
    isConnected,
    isConnecting,
    connectionError,

    // Room et utilisateurs
    currentRoom,
    users,
    currentUser,

    // Messages de chat
    messages,

    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendCursorPosition,
    sendTextSelection,
    sendTypingStarted,
    sendTypingStopped,
    toggleRoomLock,

    // État de frappe
    typingUsers,

    // Document
    documentContent,
    updateDocumentContent,
  };
}
