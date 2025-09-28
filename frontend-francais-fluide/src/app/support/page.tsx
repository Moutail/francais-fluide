'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionSimple } from '@/hooks/useSubscriptionSimple';
import Navigation from '@/components/layout/Navigation';
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Send,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Video,
  FileText,
  Users,
} from 'lucide-react';

// (Supprimé: ancien composant doublon)
// (Supprimé: bloc d'import dupliqué)

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { getStatus, canUseFeature } = useSubscriptionSimple();
  
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Rediriger les utilisateurs non connectés
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les tickets au montage du composant
  React.useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  const loadTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement tickets:', error);
    }
  };

  const faqItems = [
    {
      category: 'Général',
      questions: [
        {
          question: 'Comment fonctionne FrançaisFluide ?',
          answer: 'FrançaisFluide est une plateforme d\'apprentissage du français qui utilise l\'intelligence artificielle pour vous aider à améliorer votre écriture, grammaire et vocabulaire. Vous pouvez pratiquer avec des exercices adaptatifs, des dictées audio et recevoir des corrections personnalisées.'
        },
        {
          question: 'Quels sont les différents plans d\'abonnement ?',
          answer: 'Nous proposons 4 plans : Démo Gratuite (limité), Étudiant (14.99$/mois), Premium (29.99$/mois) et Établissement (149.99$/mois). Chaque plan offre des fonctionnalités différentes selon vos besoins.'
        },
        {
          question: 'Puis-je annuler mon abonnement à tout moment ?',
          answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L\'annulation prend effet à la fin de votre période de facturation en cours.'
        }
      ]
    },
    {
      category: 'Technique',
      questions: [
        {
          question: 'L\'application fonctionne-t-elle hors ligne ?',
          answer: 'Certaines fonctionnalités sont disponibles hors ligne avec le plan Premium et Établissement. Les corrections IA et les exercices avancés nécessitent une connexion internet.'
        },
        {
          question: 'Mes données sont-elles sécurisées ?',
          answer: 'Oui, nous utilisons un chiffrement de bout en bout et respectons le RGPD. Vos données personnelles sont protégées et ne sont jamais partagées avec des tiers.'
        },
        {
          question: 'Comment puis-je exporter mes données ?',
          answer: 'Vous pouvez exporter toutes vos données depuis la page Paramètres > Confidentialité. Un fichier ZIP contenant vos textes, exercices et statistiques vous sera envoyé par email.'
        }
      ]
    },
    {
      category: 'Pédagogie',
      questions: [
        {
          question: 'Comment l\'IA adapte-t-elle les exercices ?',
          answer: 'Notre IA analyse vos erreurs récurrentes et votre niveau de progression pour proposer des exercices personnalisés. Plus vous pratiquez, plus les exercices s\'adaptent à vos besoins spécifiques.'
        },
        {
          question: 'Puis-je suivre mes progrès ?',
          answer: 'Oui, vous avez accès à un tableau de bord détaillé avec vos statistiques, graphiques de progression, succès débloqués et objectifs personnalisés.'
        },
        {
          question: 'Y a-t-il des exercices pour tous les niveaux ?',
          answer: 'Absolument ! Nous proposons des exercices pour débutants, intermédiaires et avancés. L\'IA ajuste automatiquement la difficulté selon votre niveau.'
        }
      ]
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour envoyer une demande.');
        return;
      }

      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Votre demande a été envoyée avec succès ! Nous vous répondrons dans les 24h.');
        setContactForm({
          subject: '',
          category: '',
          priority: 'medium',
          description: ''
        });
        // Recharger les tickets
        loadTickets();
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de votre demande.');
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Centre d'aide</h1>
              <p className="text-gray-600">Trouvez des réponses à vos questions ou contactez notre équipe</p>
            </div>
          </div>

          {/* Navigation des onglets */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'faq', label: 'FAQ', icon: BookOpen },
              { id: 'contact', label: 'Contact', icon: MessageCircle },
              { id: 'tickets', label: 'Mes demandes', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* FAQ */}
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquemment posées</h2>
              
              <div className="space-y-8">
                {faqItems.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                    <div className="space-y-4">
                      {category.questions.map((item, itemIndex) => (
                        <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                          <p className="text-gray-600 text-sm">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact rapide */}
              <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Vous ne trouvez pas votre réponse ?</h3>
                <p className="text-blue-700 mb-4">
                  Notre équipe de support est là pour vous aider. Contactez-nous directement.
                </p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nous contacter
                </button>
              </div>
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contactez-nous</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulaire de contact */}
                <div>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Décrivez brièvement votre problème"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="technical">Problème technique</option>
                          <option value="billing">Facturation</option>
                          <option value="feature">Demande de fonctionnalité</option>
                          <option value="bug">Signalement de bug</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priorité
                        </label>
                        <select
                          value={contactForm.priority}
                          onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Faible</option>
                          <option value="medium">Moyenne</option>
                          <option value="high">Élevée</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description détaillée
                      </label>
                      <textarea
                        value={contactForm.description}
                        onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Décrivez votre problème ou votre demande en détail..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                    </button>
                  </form>
                </div>

                {/* Informations de contact */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Autres moyens de contact</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">support@francais-fluide.com</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Téléphone</p>
                          <p className="text-sm text-gray-600">+1 (514) 123-4567</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Heures d'ouverture</p>
                          <p className="text-sm text-gray-600">Lun-Ven: 9h-17h (EST)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources utiles</h3>
                    
                    <div className="space-y-3">
                      <a href="/guide" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700">Guide d'utilisation</span>
                      </a>
                      
                      <a href="/subscription" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="text-green-700">Plans d'abonnement</span>
                      </a>
                      
                      <a href="/tutorials" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <Video className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-700">Tutoriels vidéo</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mes demandes */}
          {activeTab === 'tickets' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes demandes de support</h2>
              
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority === 'high' ? 'Élevée' : ticket.priority === 'medium' ? 'Moyenne' : 'Faible'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'open' ? 'Ouverte' : 
                             ticket.status === 'in_progress' ? 'En cours' :
                             ticket.status === 'resolved' ? 'Résolue' : 'Fermée'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Créée le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>Catégorie: {ticket.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande</h3>
                  <p className="text-gray-600 mb-4">Vous n'avez pas encore envoyé de demande de support.</p>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Créer une demande
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
