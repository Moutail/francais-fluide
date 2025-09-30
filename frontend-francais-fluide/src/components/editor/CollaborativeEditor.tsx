'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { useCollaboration } from '@/hooks/useCollaboration';
import type { UserProfile } from '@/types';
import type { CursorPosition, TextSelection } from '@/lib/websocket/collaboration';

interface CollaborativeEditorProps {
  userProfile: UserProfile;
  roomId: string;
  documentId: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

interface UserCursor {
  user: {
    id: string;
    name: string;
    color: string;
  };
  position: CursorPosition;
  isVisible: boolean;
}

interface UserSelection {
  user: {
    id: string;
    name: string;
    color: string;
  };
  selection: TextSelection;
  isVisible: boolean;
}

export default function CollaborativeEditor({
  userProfile,
  roomId,
  documentId,
  initialContent = '',
  onContentChange,
  onSave,
  readOnly = false,
}: CollaborativeEditorProps) {
  // État de l'éditeur
  const [content, setContent] = useState(initialContent);
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de collaboration
  const {
    isConnected,
    isConnecting,
    connectionError,
    currentRoom,
    users,
    currentUser,
    messages,
    typingUsers,
    documentContent,
    connect,
    disconnect,
    sendMessage,
    sendCursorPosition,
    sendTextSelection,
    sendTypingStarted,
    sendTypingStopped,
    updateDocumentContent,
  } = useCollaboration({
    userProfile,
    roomId,
    documentId,
    autoConnect: true,
  });

  // Curseurs et sélections des autres utilisateurs
  const [userCursors, setUserCursors] = useState<UserCursor[]>([]);
  const [userSelections, setUserSelections] = useState<UserSelection[]>([]);

  // Synchroniser le contenu du document
  useEffect(() => {
    if (documentContent && documentContent !== content) {
      setContent(documentContent);
      onContentChange?.(documentContent);
    }
  }, [documentContent, content, onContentChange]);

  // Mettre à jour les curseurs des utilisateurs
  useEffect(() => {
    const cursors: UserCursor[] = users
      .filter(user => user.id !== currentUser?.id && user.cursor)
      .map(user => ({
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
        },
        position: user.cursor!,
        isVisible: true,
      }));

    setUserCursors(cursors);
  }, [users, currentUser]);

  // Mettre à jour les sélections des utilisateurs
  useEffect(() => {
    const selections: UserSelection[] = users
      .filter(user => user.id !== currentUser?.id && user.selection)
      .map(user => ({
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
        },
        selection: user.selection!,
        isVisible: true,
      }));

    setUserSelections(selections);
  }, [users, currentUser]);

  // Auto-scroll du chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Gérer les changements de contenu
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);

      // Envoyer l'opération de document
      const operation = {
        type: 'replace' as const,
        position: 0,
        length: content.length,
        text: newContent,
      };

      // Simuler l'envoi d'opération (en production, utiliser le vrai système)
      updateDocumentContent(newContent);

      // Gérer l'indication de frappe
      if (!isTyping) {
        setIsTyping(true);
        sendTypingStarted();
      }

      // Arrêter l'indication de frappe après 2 secondes
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStopped();
      }, 2000);
    },
    [
      content,
      onContentChange,
      isTyping,
      sendTypingStarted,
      sendTypingStopped,
      updateDocumentContent,
    ]
  );

  // Gérer le mouvement du curseur
  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length - 1;
    const column = lines[lines.length - 1].length;

    const cursor: CursorPosition = {
      line,
      column,
      timestamp: Date.now(),
    };

    sendCursorPosition(cursor);
  }, [sendCursorPosition]);

  const handleCursorMoveMouse = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement>) => {
      updateCursorPosition();
    },
    [updateCursorPosition]
  );

  const handleCursorMoveKey = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      updateCursorPosition();
    },
    [updateCursorPosition]
  );

  // Gérer la sélection de texte
  const handleTextSelection = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!editorRef.current) return;

      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        const textBeforeStart = textarea.value.substring(0, start);
        const textBeforeEnd = textarea.value.substring(0, end);
        const startLines = textBeforeStart.split('\n');
        const endLines = textBeforeEnd.split('\n');

        const selection: TextSelection = {
          start: {
            line: startLines.length - 1,
            column: startLines[startLines.length - 1].length,
            timestamp: Date.now(),
          },
          end: {
            line: endLines.length - 1,
            column: endLines[endLines.length - 1].length,
            timestamp: Date.now(),
          },
          text: textarea.value.substring(start, end),
          timestamp: Date.now(),
        };

        sendTextSelection(selection);
      }
    },
    [sendTextSelection]
  );

  // Envoyer un message de chat
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;

      sendMessage(chatMessage);
      setChatMessage('');
    },
    [chatMessage, sendMessage]
  );

  // Sauvegarder le document
  const handleSave = useCallback(() => {
    onSave?.(content);
  }, [content, onSave]);

  // Obtenir le nom des utilisateurs qui tapent
  const getTypingUsersText = useCallback(() => {
    if (typingUsers.length === 0) return '';

    const typingUserNames = typingUsers
      .map(userId => users.find(u => u.id === userId)?.name)
      .filter(Boolean);

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} est en train de taper...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} et ${typingUserNames[1]} sont en train de taper...`;
    } else {
      return `${typingUserNames.slice(0, -1).join(', ')} et ${typingUserNames[typingUserNames.length - 1]} sont en train de taper...`;
    }
  }, [typingUsers, users]);

  // Rendu des curseurs des utilisateurs
  const renderUserCursors = () => (
    <div className="pointer-events-none absolute inset-0">
      {userCursors.map((cursor, index) => (
        <motion.div
          key={cursor.user.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: cursor.isVisible ? 1 : 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute"
          style={{
            left: `${cursor.position.column * 8}px`, // Approximation
            top: `${cursor.position.line * 20}px`, // Approximation
          }}
        >
          <div className="relative h-5 w-0.5" style={{ backgroundColor: cursor.user.color }}>
            <div
              className="absolute -top-6 left-0 rounded px-2 py-1 text-xs text-white"
              style={{ backgroundColor: cursor.user.color }}
            >
              {cursor.user.name}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Rendu des sélections des utilisateurs
  const renderUserSelections = () => (
    <div className="pointer-events-none absolute inset-0">
      {userSelections.map((selection, index) => (
        <motion.div
          key={`${selection.user.id}-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: selection.isVisible ? 0.3 : 0 }}
          exit={{ opacity: 0 }}
          className="absolute rounded"
          style={{
            backgroundColor: selection.user.color,
            left: `${selection.selection.start.column * 8}px`,
            top: `${selection.selection.start.line * 20}px`,
            width: `${(selection.selection.end.column - selection.selection.start.column) * 8}px`,
            height: `${(selection.selection.end.line - selection.selection.start.line + 1) * 20}px`,
          }}
        >
          <div
            className="absolute -top-6 left-0 rounded px-2 py-1 text-xs text-white"
            style={{ backgroundColor: selection.user.color }}
          >
            {selection.user.name}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Éditeur principal */}
      <div className="flex flex-1 flex-col">
        {/* Barre d'outils */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Éditeur Collaboratif</h2>

              {/* Indicateur de connexion */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connecté' : isConnecting ? 'Connexion...' : 'Déconnecté'}
                </span>
              </div>

              {/* Nombre d'utilisateurs */}
              <Badge variant="outline">
                {users.length} utilisateur{users.length > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setShowUserList(!showUserList)} variant="outline" size="sm">
                👥 Utilisateurs
              </Button>

              <Button onClick={() => setShowChat(!showChat)} variant="outline" size="sm">
                💬 Chat
              </Button>

              <Button onClick={handleSave} variant="outline" size="sm">
                💾 Sauvegarder
              </Button>
            </div>
          </div>

          {/* Utilisateurs qui tapent */}
          {getTypingUsersText() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm italic text-gray-500"
            >
              {getTypingUsersText()}
            </motion.div>
          )}
        </div>

        {/* Zone d'édition */}
        <div className="relative flex-1">
          <textarea
            ref={editorRef}
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            onMouseMove={handleCursorMoveMouse}
            onMouseUp={handleTextSelection}
            onKeyUp={handleCursorMoveKey}
            placeholder="Commencez à écrire... Les autres utilisateurs verront vos modifications en temps réel."
            className="h-full w-full resize-none border-0 p-4 font-mono text-sm leading-relaxed focus:outline-none"
            readOnly={readOnly || currentRoom?.isLocked}
          />

          {/* Curseurs et sélections des autres utilisateurs */}
          {renderUserCursors()}
          {renderUserSelections()}
        </div>

        {/* Barre de statut */}
        <div className="border-t border-gray-200 bg-white p-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {content.length} caractères, {content.split('\n').length} lignes
            </span>
            <span>{currentRoom?.isLocked ? '🔒 Verrouillé' : '🔓 Déverrouillé'}</span>
          </div>
        </div>
      </div>

      {/* Panneau latéral */}
      <AnimatePresence>
        {(showChat || showUserList) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-l border-gray-200 bg-white"
          >
            {/* Onglets */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setShowUserList(true)}
                className={`flex-1 p-3 text-sm font-medium ${
                  showUserList
                    ? 'border-b-2 border-blue-700 bg-blue-50 text-blue-700'
                    : 'text-gray-600'
                }`}
              >
                👥 Utilisateurs ({users.length})
              </button>
              <button
                onClick={() => setShowChat(true)}
                className={`flex-1 p-3 text-sm font-medium ${
                  showChat ? 'border-b-2 border-blue-700 bg-blue-50 text-blue-700' : 'text-gray-600'
                }`}
              >
                💬 Chat ({messages.length})
              </button>
            </div>

            {/* Contenu des onglets */}
            <div className="flex-1 overflow-hidden">
              {showUserList && (
                <div className="p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Utilisateurs connectés</h3>
                  <div className="space-y-2">
                    {users.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.isTyping ? 'En train de taper...' : 'En ligne'}
                          </div>
                        </div>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">
                            Vous
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showChat && (
                <div className="flex h-full flex-col">
                  {/* Messages */}
                  <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.userId === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-3 py-2 ${
                            message.userId === currentUser?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="mb-1 text-xs font-medium">{message.userName}</div>
                          <div className="text-sm">{message.content}</div>
                          <div className="mt-1 text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formulaire de message */}
                  <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        placeholder="Tapez un message..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button type="submit" size="sm">
                        Envoyer
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
