'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import CollaborativeEditor from '@/components/editor/CollaborativeEditor';
import type { UserProfile } from '@/types';

// Mock user profile pour les tests
const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Utilisateur Test',
  email: 'test@example.com',
  level: 'intermediate',
  weaknesses: [],
  strengths: [],
  preferences: {
    realTimeCorrection: true,
    soundEffects: false,
    animations: true,
    difficulty: 'medium'
  },
  statistics: {
    totalWords: 0,
    totalErrors: 0,
    totalCorrections: 0,
    accuracyRate: 0,
    dailyStreak: 0,
    bestStreak: 0,
    totalPracticeTime: 0,
    lastPracticeDate: new Date(),
    progressByCategory: {}
  }
};

export default function CollaborativeEditorPage() {
  const [roomId, setRoomId] = useState('room-1');
  const [documentId, setDocumentId] = useState('doc-1');
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [savedContent, setSavedContent] = useState('');

  const handleContentChange = (content: string) => {
    console.log('Contenu modifié:', content);
  };

  const handleSave = (content: string) => {
    setSavedContent(content);
    console.log('Contenu sauvegardé:', content);
  };

  const handleStartCollaboration = () => {
    setIsEditorVisible(true);
  };

  const handleStopCollaboration = () => {
    setIsEditorVisible(false);
  };

  if (isEditorVisible) {
    return (
      <CollaborativeEditor
        userProfile={mockUserProfile}
        roomId={roomId}
        documentId={documentId}
        initialContent="Bonjour ! Commencez à écrire ici pour tester l'édition collaborative en temps réel."
        onContentChange={handleContentChange}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Éditeur Collaboratif
            </h1>
            <p className="text-gray-600 text-lg">
              Testez l'édition collaborative en temps réel avec WebSocket
            </p>
          </div>

          {/* Configuration */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de la Room
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="room-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID du Document
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="doc-1"
              />
            </div>
          </div>

          {/* Informations sur l'utilisateur */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Utilisateur de Test</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Nom:</strong> {mockUserProfile.name}</p>
              <p><strong>ID:</strong> {mockUserProfile.id}</p>
              <p><strong>Niveau:</strong> {mockUserProfile.level}</p>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🔌 WebSocket</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Connexion temps réel</li>
                <li>• Reconnexion automatique</li>
                <li>• Gestion des erreurs</li>
                <li>• État de connexion</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">👥 Collaboration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Curseurs multiples</li>
                <li>• Sélections partagées</li>
                <li>• Indicateurs de frappe</li>
                <li>• Chat intégré</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">📝 Édition</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Synchronisation temps réel</li>
                <li>• Résolution de conflits (CRDT)</li>
                <li>• Opérations de document</li>
                <li>• Versioning automatique</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🎨 Interface</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Curseurs colorés</li>
                <li>• Sélections visuelles</li>
                <li>• Animations fluides</li>
                <li>• Design responsive</li>
              </ul>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleStartCollaboration}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
            >
              🚀 Démarrer la Collaboration
            </Button>
          </div>

          {/* Contenu sauvegardé */}
          {savedContent && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">Contenu Sauvegardé</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {savedContent}
                </pre>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-3">📋 Instructions de Test</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>1. <strong>Ouvrez plusieurs onglets</strong> de cette page pour simuler plusieurs utilisateurs</p>
              <p>2. <strong>Démarrez la collaboration</strong> dans chaque onglet avec le même Room ID</p>
              <p>3. <strong>Écrivez du texte</strong> dans un onglet et observez la synchronisation</p>
              <p>4. <strong>Testez le chat</strong> pour communiquer entre utilisateurs</p>
              <p>5. <strong>Observez les curseurs</strong> et sélections des autres utilisateurs</p>
              <p>6. <strong>Testez la reconnexion</strong> en fermant/rouvrant un onglet</p>
            </div>
          </div>

          {/* Note sur la simulation */}
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Ceci est une simulation côté client. En production, 
              un serveur WebSocket réel serait nécessaire pour la synchronisation entre utilisateurs.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
