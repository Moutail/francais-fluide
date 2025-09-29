'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { 
  BookOpen,
  Lightbulb,
  FileText,
  CheckCircle,
  Target,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Download,
  Share
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface DissertationType {
  id: string;
  name: string;
  description: string;
  structure: string[];
  examples: string[];
}

interface DissertationPlan {
  title: string;
  introduction: {
    accroche: string;
    contextualisation: string;
    problematique: string;
    annonce_plan: string;
  };
  plan: Array<{
    partie: string;
    sous_parties: Array<{
      titre: string;
      arguments: string[];
      exemples: string[];
      transition: string;
    }>;
  }>;
  conclusion: {
    synthese: string;
    ouverture: string;
  };
  conseils: string[];
}

export default function DissertationAssistant() {
  const [currentStep, setCurrentStep] = useState<'select' | 'subject' | 'plan' | 'write' | 'analyze'>('select');
  const [selectedType, setSelectedType] = useState<DissertationType | null>(null);
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [generatedPlan, setGeneratedPlan] = useState<DissertationPlan | null>(null);
  const [userText, setUserText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [types, setTypes] = useState<DissertationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDissertationTypes();
  }, []);

  const loadDissertationTypes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.makeRequest('/api/dissertation/types');
      
      if (response.success) {
        setTypes(response.data.types);
      } else {
        setError(response.error || 'Erreur de chargement');
      }
    } catch (err: any) {
      if (err.message.includes('Premium')) {
        setError('Cette fonctionnalité nécessite un abonnement Premium ou Établissement.');
      } else {
        setError('Erreur de connexion');
      }
      console.error('Erreur chargement types:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!selectedType || !subject.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.makeRequest('/api/dissertation/plan', {
        method: 'POST',
        body: JSON.stringify({
          type: selectedType.id,
          subject: subject.trim(),
          level
        })
      });

      if (response.success) {
        setGeneratedPlan(response.data.plan);
        setCurrentStep('plan');
      } else {
        setError(response.error || 'Erreur lors de la génération du plan');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      console.error('Erreur génération plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDissertation = async () => {
    if (!selectedType || !subject.trim() || !userText.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.makeRequest('/api/dissertation/analyze', {
        method: 'POST',
        body: JSON.stringify({
          text: userText,
          type: selectedType.id,
          subject: subject.trim(),
          options: {
            level,
            checkStructure: true,
            checkStyle: true,
            checkArguments: true
          }
        })
      });

      if (response.success) {
        setAnalysis(response.data.analysis);
        setCurrentStep('analyze');
      } else {
        setError(response.error || 'Erreur lors de l\'analyse');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      console.error('Erreur analyse:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAssistant = () => {
    setCurrentStep('select');
    setSelectedType(null);
    setSubject('');
    setGeneratedPlan(null);
    setUserText('');
    setAnalysis(null);
    setError(null);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'select', label: 'Type', icon: BookOpen },
      { id: 'subject', label: 'Sujet', icon: Lightbulb },
      { id: 'plan', label: 'Plan', icon: FileText },
      { id: 'write', label: 'Rédaction', icon: Target },
      { id: 'analyze', label: 'Analyse', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isAccessible = index <= currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${isActive ? 'bg-blue-600 border-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 border-green-600 text-white' :
                  isAccessible ? 'border-blue-600 text-blue-600' :
                  'border-gray-300 text-gray-300'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && types.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'assistant de dissertation...</p>
        </Card>
      </div>
    );
  }

  if (error && types.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Sparkles className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assistant de Dissertation Premium
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/subscription'}>
            Découvrir Premium
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assistant de Dissertation IA
          </h1>
          <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-sm font-medium">
            Premium
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Votre assistant intelligent pour maîtriser l'art de la dissertation française. 
          Entraînement personnalisé, correction avancée et conseils d'expert.
        </p>
      </div>

      {/* Indicateur d'étapes */}
      {renderStepIndicator()}

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <Target className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Contenu selon l'étape */}
      {currentStep === 'select' && (
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Choisissez le type de dissertation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map((type) => (
              <div
                key={type.id}
                onClick={() => {
                  setSelectedType(type);
                  setCurrentStep('subject');
                }}
                className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
              >
                <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600">
                  {type.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {type.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">STRUCTURE:</p>
                  <div className="flex flex-wrap gap-1">
                    {type.structure.map((part, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">EXEMPLES:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {type.examples.slice(0, 2).map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {currentStep === 'subject' && selectedType && (
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Définissez votre sujet
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Type sélectionné :</span>
              </div>
              <p className="text-blue-700">{selectedType.name}</p>
              <p className="text-sm text-blue-600 mt-1">{selectedType.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet de votre dissertation
              </label>
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Exemple: ${selectedType.examples[0]}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-2">
                Soyez précis dans la formulation de votre sujet pour obtenir un plan optimal.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de difficulté
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: 'Débutant', desc: 'Structure simple' },
                  { value: 'intermediate', label: 'Intermédiaire', desc: 'Analyse approfondie' },
                  { value: 'advanced', label: 'Avancé', desc: 'Réflexion complexe' }
                ].map((levelOption) => (
                  <div
                    key={levelOption.value}
                    onClick={() => setLevel(levelOption.value)}
                    className={`p-3 border rounded-lg cursor-pointer text-center transition-all ${
                      level === levelOption.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{levelOption.label}</div>
                    <div className="text-xs text-gray-600">{levelOption.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setCurrentStep('select')}
                variant="secondary"
              >
                Retour
              </Button>
              <Button
                onClick={generatePlan}
                disabled={!subject.trim() || loading}
                className="min-w-32"
              >
                {loading ? 'Génération...' : 'Générer le plan'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'plan' && generatedPlan && (
        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Plan généré
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep('subject')}
                  variant="secondary"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  onClick={() => setCurrentStep('write')}
                  size="sm"
                >
                  Commencer à rédiger
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Titre */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{generatedPlan.title}</h3>
              </div>

              {/* Introduction */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Introduction
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Accroche :</span>
                    <p className="text-gray-600 mt-1">{generatedPlan.introduction.accroche}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contextualisation :</span>
                    <p className="text-gray-600 mt-1">{generatedPlan.introduction.contextualisation}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Problématique :</span>
                    <p className="text-gray-600 mt-1 font-medium">{generatedPlan.introduction.problematique}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Annonce du plan :</span>
                    <p className="text-gray-600 mt-1">{generatedPlan.introduction.annonce_plan}</p>
                  </div>
                </div>
              </div>

              {/* Plan détaillé */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Développement
                </h4>
                
                {generatedPlan.plan.map((partie, partieIndex) => (
                  <div key={partieIndex} className="p-6 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-4">{partie.partie}</h5>
                    
                    <div className="space-y-4">
                      {partie.sous_parties.map((sousPartie, sousIndex) => (
                        <div key={sousIndex} className="pl-4 border-l-2 border-blue-200">
                          <h6 className="font-medium text-gray-800 mb-2">{sousPartie.titre}</h6>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Arguments :</span>
                              <ul className="mt-1 space-y-1">
                                {sousPartie.arguments.map((arg, argIndex) => (
                                  <li key={argIndex} className="text-gray-600">• {arg}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Exemples :</span>
                              <ul className="mt-1 space-y-1">
                                {sousPartie.exemples.map((ex, exIndex) => (
                                  <li key={exIndex} className="text-gray-600">• {ex}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {sousPartie.transition && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <span className="text-xs font-medium text-yellow-800">Transition :</span>
                              <p className="text-yellow-700 text-sm mt-1">{sousPartie.transition}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="p-6 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Conclusion
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Synthèse :</span>
                    <p className="text-gray-600 mt-1">{generatedPlan.conclusion.synthese}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ouverture :</span>
                    <p className="text-gray-600 mt-1">{generatedPlan.conclusion.ouverture}</p>
                  </div>
                </div>
              </div>

              {/* Conseils */}
              {generatedPlan.conseils && generatedPlan.conseils.length > 0 && (
                <div className="p-6 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Conseils de rédaction
                  </h4>
                  <ul className="space-y-2">
                    {generatedPlan.conseils.map((conseil, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-purple-600 mt-1">•</span>
                        <span className="text-gray-700">{conseil}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {currentStep === 'write' && (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Rédigez votre dissertation
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep('plan')}
                variant="secondary"
                size="sm"
              >
                Voir le plan
              </Button>
              <Button
                onClick={analyzeDissertation}
                disabled={!userText.trim() || loading}
                size="sm"
              >
                {loading ? 'Analyse...' : 'Analyser'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone de rédaction */}
            <div className="lg:col-span-2">
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Commencez à rédiger votre dissertation ici..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
              />
              
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>Mots: {userText.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                <span>Caractères: {userText.length}</span>
                <span>Temps estimé: {Math.ceil(userText.trim().split(/\s+/).length / 200)} min de lecture</span>
              </div>
            </div>

            {/* Plan de référence */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Plan de référence
                  </h3>
                  
                  {generatedPlan && (
                    <div className="space-y-3 text-sm">
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="font-medium text-yellow-800">Problématique :</span>
                        <p className="text-yellow-700 mt-1">{generatedPlan.introduction.problematique}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {generatedPlan.plan.map((partie, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium text-gray-800">{partie.partie}</div>
                            {partie.sous_parties.map((sp, spIndex) => (
                              <div key={spIndex} className="text-gray-600 text-xs mt-1 ml-2">
                                {sp.titre}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'analyze' && analysis && (
        <div className="space-y-6">
          {/* Score global */}
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className={`text-6xl font-bold mb-2 ${
                analysis.score_global >= 80 ? 'text-green-600' :
                analysis.score_global >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysis.score_global}%
              </div>
              <p className="text-xl text-gray-700">Score global</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysis.scores_detailles as Record<string, number>).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback détaillé */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Points forts
              </h3>
              <ul className="space-y-2">
                {analysis.points_forts.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Points à améliorer
              </h3>
              <ul className="space-y-2">
                {analysis.points_amelioration.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Feedback personnalisé */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Feedback personnalisé
            </h3>
            <p className="text-gray-700 leading-relaxed">{analysis.feedback_personnalise}</p>
          </Card>

          {/* Prochaines étapes */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Prochaines étapes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.prochaines_etapes.map((etape: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{etape}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setCurrentStep('write')}
              variant="secondary"
            >
              Modifier le texte
            </Button>
            <Button
              onClick={resetAssistant}
              variant="secondary"
            >
              Nouvelle dissertation
            </Button>
            <Button
              onClick={() => {
                // Implémenter l'export/sauvegarde
                const dataStr = JSON.stringify({ plan: generatedPlan, analysis, text: userText }, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `dissertation-${selectedType?.id}-${Date.now()}.json`;
                link.click();
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </Button>
          </div>
        </div>
      )}

      {/* Bouton de reset global */}
      {currentStep !== 'select' && (
        <div className="text-center">
          <Button
            onClick={resetAssistant}
            variant="secondary"
            className="text-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer depuis le début
          </Button>
        </div>
      )}
    </div>
  );
}
