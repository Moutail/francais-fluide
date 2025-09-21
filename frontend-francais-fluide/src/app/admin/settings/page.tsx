// src/app/admin/settings/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  ArrowLeft,
  Globe,
  Shield,
  Mail,
  CreditCard,
  Database,
  Bell,
  Users,
  Key,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  supportEmail: string;
  adminEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxUsersPerPlan: {
    free: number;
    student: number;
    premium: number;
    enterprise: number;
  };
  apiLimits: {
    free: number;
    student: number;
    premium: number;
    enterprise: number;
  };
  stripePublicKey: string;
  stripeSecretKey: string;
  databaseUrl: string;
  jwtSecret: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  analyticsEnabled: boolean;
  errorReporting: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'FrançaisFluide',
    siteDescription: 'L\'application intelligente qui transforme l\'apprentissage du français',
    siteUrl: 'https://francais-fluide.com',
    supportEmail: 'support@francais-fluide.com',
    adminEmail: 'admin@francais-fluide.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxUsersPerPlan: {
      free: 1000,
      student: 5000,
      premium: 10000,
      enterprise: 50000
    },
    apiLimits: {
      free: 100,
      student: 1000,
      premium: 5000,
      enterprise: 50000
    },
    stripePublicKey: 'pk_live_...',
    stripeSecretKey: 'sk_live_...',
    databaseUrl: 'postgresql://...',
    jwtSecret: 'your-secret-key',
    emailNotifications: true,
    pushNotifications: true,
    analyticsEnabled: true,
    errorReporting: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulation de la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Afficher une notification de succès
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: keyof SiteSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: Globe },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payments', name: 'Paiements', icon: CreditCard },
    { id: 'database', name: 'Base de données', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'api', name: 'API', icon: Key }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Paramètres du site</h1>
                  <p className="text-sm text-gray-600">Configuration et administration</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres généraux</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du site
                        </label>
                        <input
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => handleInputChange('siteName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL du site
                        </label>
                        <input
                          type="url"
                          value={settings.siteUrl}
                          onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description du site
                      </label>
                      <textarea
                        value={settings.siteDescription}
                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email de support
                        </label>
                        <input
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email administrateur
                        </label>
                        <input
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Mode maintenance</h4>
                          <p className="text-sm text-gray-500">Désactiver l'accès public au site</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Inscription activée</h4>
                          <p className="text-sm text-gray-500">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.registrationEnabled}
                            onChange={(e) => handleInputChange('registrationEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de sécurité</h3>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Attention</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Les modifications des paramètres de sécurité peuvent affecter l'accès des utilisateurs.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Vérification email requise</h4>
                          <p className="text-sm text-gray-500">Les utilisateurs doivent vérifier leur email pour activer leur compte</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailVerificationRequired}
                            onChange={(e) => handleInputChange('emailVerificationRequired', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clé secrète JWT
                        </label>
                        <div className="relative">
                          <input
                            type={showSecrets ? 'text' : 'password'}
                            value={settings.jwtSecret}
                            onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Paiements */}
              {activeTab === 'payments' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuration des paiements</h3>
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-800">Stripe configuré</h4>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Les paiements sont activés et fonctionnels.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clé publique Stripe
                        </label>
                        <div className="relative">
                          <input
                            type={showSecrets ? 'text' : 'password'}
                            value={settings.stripePublicKey}
                            onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clé secrète Stripe
                        </label>
                        <div className="relative">
                          <input
                            type={showSecrets ? 'text' : 'password'}
                            value={settings.stripeSecretKey}
                            onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Utilisateurs */}
              {activeTab === 'users' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Limites des utilisateurs</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utilisateurs gratuits maximum
                        </label>
                        <input
                          type="number"
                          value={settings.maxUsersPerPlan.free}
                          onChange={(e) => handleNestedInputChange('maxUsersPerPlan', 'free', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utilisateurs étudiants maximum
                        </label>
                        <input
                          type="number"
                          value={settings.maxUsersPerPlan.student}
                          onChange={(e) => handleNestedInputChange('maxUsersPerPlan', 'student', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utilisateurs premium maximum
                        </label>
                        <input
                          type="number"
                          value={settings.maxUsersPerPlan.premium}
                          onChange={(e) => handleNestedInputChange('maxUsersPerPlan', 'premium', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utilisateurs entreprise maximum
                        </label>
                        <input
                          type="number"
                          value={settings.maxUsersPerPlan.enterprise}
                          onChange={(e) => handleNestedInputChange('maxUsersPerPlan', 'enterprise', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Limites API par plan</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Gratuit: {settings.apiLimits.free} requêtes/jour</div>
                        <div>Étudiant: {settings.apiLimits.student} requêtes/jour</div>
                        <div>Premium: {settings.apiLimits.premium} requêtes/jour</div>
                        <div>Entreprise: {settings.apiLimits.enterprise} requêtes/jour</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de notifications</h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notifications email</h4>
                          <p className="text-sm text-gray-500">Envoyer des notifications par email aux utilisateurs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
                          <p className="text-sm text-gray-500">Envoyer des notifications push aux utilisateurs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Analytics activées</h4>
                          <p className="text-sm text-gray-500">Collecter des données d'analyse d'utilisation</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.analyticsEnabled}
                            onChange={(e) => handleInputChange('analyticsEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Rapport d'erreurs</h4>
                          <p className="text-sm text-gray-500">Envoyer automatiquement les rapports d'erreurs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.errorReporting}
                            onChange={(e) => handleInputChange('errorReporting', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
