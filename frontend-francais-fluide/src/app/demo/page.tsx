// src/app/demo/page.tsx
'use client';

import React, { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { ProfessionalEditor } from '@/components/editor/ProfessionalEditor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  BarChart3, 
  Clock,
  Target
} from 'lucide-react';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoContent, setDemoContent] = useState('');

  const steps = [
    {
      title: 'Éditeur intelligent',
      description: 'Corrigez vos textes en temps réel avec notre IA avancée',
      content: 'Bonjour, je suis un étudiant qui apprend le français. J\'aimerais améliorer mon écriture et corriger mes fautes de grammaire. Pouvez-vous m\'aider à progresser dans cette langue magnifique ?'
    },
    {
      title: 'Analytics détaillées',
      description: 'Suivez vos progrès avec des métriques précises',
      content: ''
    },
    {
      title: 'Exercices personnalisés',
      description: 'Pratiquez avec des exercices adaptés à votre niveau',
      content: ''
    }
  ];

  const handleContentChange = (content: string) => {
    setDemoContent(content);
  };

  const handleSave = (content: string) => {
    console.log('Saving content:', content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Démonstration de FrançaisFluide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment notre plateforme peut transformer votre apprentissage du français
            </p>
          </div>

          {/* Navigation des étapes */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentStep === index
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu de la démonstration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zone principale */}
            <div>
              {currentStep === 0 && (
                <ProfessionalEditor
                  initialValue={steps[0].content}
                  onContentChange={handleContentChange}
                  onSave={handleSave}
                  placeholder="Commencez à écrire votre texte..."
                />
              )}
              
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics de progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">94.7%</div>
                          <div className="text-sm text-gray-600">Précision</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">1,247</div>
                          <div className="text-sm text-gray-600">Mots écrits</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Progression sur 30 jours</h4>
                        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Exercices personnalisés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Accord du participe passé</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Complétez la phrase avec le bon accord :
                        </p>
                        <p className="text-sm text-gray-800 italic">
                          "Les lettres que j'ai _____ hier sont arrivées."
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="secondary">écrites</Button>
                          <Button size="sm" variant="ghost">écrit</Button>
                          <Button size="sm" variant="ghost">écrite</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar avec informations */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Corrections en temps réel</h4>
                        <p className="text-sm text-gray-600">
                          Obtenez des suggestions instantanées pendant que vous écrivez
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Assistant IA intelligent</h4>
                        <p className="text-sm text-gray-600">
                          Une IA formée spécifiquement pour le français
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Analytics détaillées</h4>
                        <p className="text-sm text-gray-600">
                          Suivez vos progrès avec des métriques précises
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prêt à commencer ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Rejoignez des milliers d'utilisateurs qui améliorent déjà leur français
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => (window.location.href = '/auth/login')}>
                      Commencer l'essai gratuit
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/subscription')}>
                      Voir les plans d'abonnement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}