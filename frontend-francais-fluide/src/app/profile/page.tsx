'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, Button, Badge } from '@/components/ui';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Settings, 
  Edit3,
  Save,
  X,
  Star,
  TrendingUp,
  Clock,
  BookOpen,
  Award
} from 'lucide-react';
import type { UserProfile, UserStatistics } from '@/types';

// Données mockées pour le profil utilisateur
const mockUserProfile: UserProfile = {
  id: '1',
  email: 'utilisateur@example.com',
  name: 'Marie Dubois',
  level: 'intermediate',
  nativeLanguage: 'Anglais',
  weaknesses: ['Conjugaison', 'Accord des participes passés'],
  strengths: ['Vocabulaire', 'Expression orale'],
  preferences: {
    realTimeCorrection: true,
    soundEffects: true,
    animations: true,
    difficulty: 'intermediate'
  },
  statistics: {
    totalWords: 15420,
    totalErrors: 342,
    totalCorrections: 298,
    accuracyRate: 87.5,
    dailyStreak: 12,
    bestStreak: 28,
    totalPracticeTime: 45.5, // en heures
    lastPracticeDate: new Date('2024-01-20'),
    progressByCategory: {
      'Grammaire': 75,
      'Vocabulaire': 90,
      'Conjugaison': 65,
      'Expression écrite': 80,
      'Compréhension': 85
    }
  }
};

const levelLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert'
};

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
  expert: 'bg-yellow-100 text-yellow-800'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    nativeLanguage: profile.nativeLanguage || '',
    preferences: { ...profile.preferences }
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      name: editForm.name,
      nativeLanguage: editForm.nativeLanguage,
      preferences: editForm.preferences
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: profile.name,
      nativeLanguage: profile.nativeLanguage || '',
      preferences: { ...profile.preferences }
    });
    setIsEditing(false);
  };

  const handlePreferenceChange = (key: keyof typeof profile.preferences, value: any) => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
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
            className="p-6"
          >
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mon profil
              </h1>
              <p className="text-gray-600">
                Gérez vos informations personnelles et vos préférences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations personnelles */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informations personnelles
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isEditing ? handleSave : handleEdit}
                      className="flex items-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          Sauvegarder
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Modifier
                        </>
                      )}
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Langue maternelle
                        </label>
                        <select
                          value={editForm.nativeLanguage}
                          onChange={(e) => setEditForm(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner une langue</option>
                          <option value="Anglais">Anglais</option>
                          <option value="Espagnol">Espagnol</option>
                          <option value="Allemand">Allemand</option>
                          <option value="Italien">Italien</option>
                          <option value="Portugais">Portugais</option>
                          <option value="Arabe">Arabe</option>
                          <option value="Chinois">Chinois</option>
                          <option value="Japonais">Japonais</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="flex-1">
                          Sauvegarder
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-600">Nom</span>
                          <p className="font-medium">{profile.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-600">Email</span>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-600">Langue maternelle</span>
                          <p className="font-medium">{profile.nativeLanguage || 'Non spécifiée'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-600">Niveau</span>
                          <Badge className={levelColors[profile.level]}>
                            {levelLabels[profile.level]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Préférences */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Préférences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Correction en temps réel</h3>
                        <p className="text-sm text-gray-600">Afficher les suggestions pendant la frappe</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEditing ? editForm.preferences.realTimeCorrection : profile.preferences.realTimeCorrection}
                          onChange={(e) => handlePreferenceChange('realTimeCorrection', e.target.checked)}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Effets sonores</h3>
                        <p className="text-sm text-gray-600">Jouer des sons pour les interactions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEditing ? editForm.preferences.soundEffects : profile.preferences.soundEffects}
                          onChange={(e) => handlePreferenceChange('soundEffects', e.target.checked)}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Animations</h3>
                        <p className="text-sm text-gray-600">Afficher les animations et transitions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEditing ? editForm.preferences.animations : profile.preferences.animations}
                          onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                          disabled={!isEditing}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Niveau de difficulté</h3>
                        <p className="text-sm text-gray-600">Difficulté par défaut des exercices</p>
                      </div>
                      <select
                        value={isEditing ? editForm.preferences.difficulty : profile.preferences.difficulty}
                        onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="beginner">Débutant</option>
                        <option value="intermediate">Intermédiaire</option>
                        <option value="advanced">Avancé</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Statistiques et points forts/faibles */}
              <div className="space-y-6">
                {/* Statistiques rapides */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Statistiques
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Mots écrits</span>
                      </div>
                      <span className="font-semibold">{profile.statistics.totalWords.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Précision</span>
                      </div>
                      <span className="font-semibold">{profile.statistics.accuracyRate}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Temps de pratique</span>
                      </div>
                      <span className="font-semibold">{profile.statistics.totalPracticeTime}h</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Série actuelle</span>
                      </div>
                      <span className="font-semibold">{profile.statistics.dailyStreak} jours</span>
                    </div>
                  </div>
                </Card>

                {/* Points forts */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Points forts
                  </h2>

                  <div className="space-y-2">
                    {profile.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Points à améliorer */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    À améliorer
                  </h2>

                  <div className="space-y-2">
                    {profile.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Progression par catégorie */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Progression par catégorie
                  </h2>

                  <div className="space-y-3">
                    {Object.entries(profile.statistics.progressByCategory).map(([category, progress]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{category}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
