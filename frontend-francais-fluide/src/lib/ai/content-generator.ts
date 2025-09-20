// src/lib/ai/content-generator.ts

/**
 * Générateur de contenu IA pour FrançaisFluide
 * Création d'exercices personnalisés, textes adaptés et explications pédagogiques
 */

// Types pour la génération de contenu
export interface ContentGenerationRequest {
  type: 'exercise' | 'text' | 'explanation' | 'reformulation';
  level: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
  length?: number;
  difficulty?: number;
  focus?: string[];
  context?: string;
  userProfile?: UserProfile;
}

export interface UserProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  weakPoints: string[];
  strongPoints: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  goals: string[];
}

export interface GeneratedExercise {
  id: string;
  type: 'multiple-choice' | 'fill-blanks' | 'transformation' | 'translation' | 'writing';
  title: string;
  description: string;
  content: ExerciseContent;
  instructions: string;
  difficulty: number;
  estimatedTime: number;
  learningObjectives: string[];
  hints: string[];
  solution: ExerciseSolution;
  explanations: string[];
  relatedTopics: string[];
}

export interface ExerciseContent {
  text?: string;
  questions: ExerciseQuestion[];
  options?: string[][];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    description: string;
  }[];
}

export interface ExerciseQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

export interface ExerciseSolution {
  answers: Record<string, string | string[]>;
  explanations: Record<string, string>;
  score: number;
  feedback: string;
}

export interface GeneratedText {
  id: string;
  title: string;
  content: string;
  level: string;
  theme: string;
  vocabulary: string[];
  grammarPoints: string[];
  readingTime: number;
  comprehensionQuestions: ExerciseQuestion[];
  culturalNotes: string[];
}

export interface PedagogicalExplanation {
  concept: string;
  definition: string;
  examples: string[];
  rules: string[];
  exceptions: string[];
  commonMistakes: string[];
  practiceTips: string[];
  relatedConcepts: string[];
  visualAids?: string[];
}

export interface ReformulationSuggestion {
  original: string;
  reformulated: string;
  reason: string;
  alternatives: string[];
  level: string;
  improvements: string[];
}

// Prompts optimisés pour la génération de contenu
const CONTENT_GENERATION_PROMPTS = {
  exercise: `Tu es un expert pédagogique en français. Crée un exercice personnalisé.

PROFIL UTILISATEUR:
- Niveau: {level}
- Thème: {theme}
- Difficulté: {difficulty}/10
- Points faibles: {weakPoints}
- Points forts: {strongPoints}
- Style d'apprentissage: {learningStyle}

TYPE D'EXERCICE: {exerciseType}

Réponds en JSON:
{
  "id": "exercice-unique-id",
  "type": "{exerciseType}",
  "title": "Titre accrocheur",
  "description": "Description claire de l'exercice",
  "content": {
    "text": "Texte de base si nécessaire",
    "questions": [
      {
        "id": "q1",
        "text": "Question claire et précise",
        "type": "multiple-choice|fill-blank|open-ended",
        "points": 2,
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "réponse correcte",
        "explanation": "Explication pédagogique"
      }
    ]
  },
  "instructions": "Instructions détaillées",
  "difficulty": {difficulty},
  "estimatedTime": 5,
  "learningObjectives": ["objectif1", "objectif2"],
  "hints": ["indice1", "indice2"],
  "solution": {
    "answers": {"q1": "réponse"},
    "explanations": {"q1": "explication"},
    "score": 10,
    "feedback": "Feedback personnalisé"
  },
  "explanations": ["explication globale 1", "explication globale 2"],
  "relatedTopics": ["topic1", "topic2"]
}`,

  text: `Tu es un auteur de textes éducatifs en français. Crée un texte adapté.

NIVEAU: {level}
THÈME: {theme}
LONGUEUR: {length} mots
VOCABULAIRE: {vocabulary}

Réponds en JSON:
{
  "id": "texte-unique-id",
  "title": "Titre du texte",
  "content": "Texte complet adapté au niveau",
  "level": "{level}",
  "theme": "{theme}",
  "vocabulary": ["mot1", "mot2", "mot3"],
  "grammarPoints": ["point1", "point2"],
  "readingTime": 3,
  "comprehensionQuestions": [
    {
      "id": "c1",
      "text": "Question de compréhension",
      "type": "open-ended",
      "points": 2
    }
  ],
  "culturalNotes": ["note culturelle 1", "note culturelle 2"]
}`,

  explanation: `Tu es un professeur de français. Explique ce concept de manière pédagogique.

CONCEPT: {concept}
NIVEAU: {level}
CONTEXTE: {context}

Réponds en JSON:
{
  "concept": "{concept}",
  "definition": "Définition claire et précise",
  "examples": ["exemple1", "exemple2", "exemple3"],
  "rules": ["règle1", "règle2"],
  "exceptions": ["exception1", "exception2"],
  "commonMistakes": ["erreur1", "erreur2"],
  "practiceTips": ["conseil1", "conseil2"],
  "relatedConcepts": ["concept1", "concept2"],
  "visualAids": ["aide1", "aide2"]
}`,

  reformulation: `Tu es un expert en style français. Améliore ce texte.

TEXTE ORIGINAL: "{original}"
NIVEAU CIBLE: {level}
CONTEXTE: {context}

Réponds en JSON:
{
  "original": "{original}",
  "reformulated": "Version améliorée",
  "reason": "Pourquoi cette amélioration",
  "alternatives": ["alternative1", "alternative2"],
  "level": "{level}",
  "improvements": ["amélioration1", "amélioration2"]
}`
};

class AIContentGenerator {
  private cache: Map<string, any>;
  private rateLimiter: { count: number; resetTime: number };
  private generationHistory: Array<{ type: string; timestamp: number; cost: number }>;

  constructor() {
    this.cache = new Map();
    this.rateLimiter = { count: 0, resetTime: Date.now() + 60000 };
    this.generationHistory = [];
  }

  /**
   * Génère un exercice personnalisé
   */
  public async generateExercise(request: ContentGenerationRequest): Promise<GeneratedExercise> {
    const cacheKey = this.generateCacheKey('exercise', request);
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Vérifier le rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit atteint');
    }

    const prompt = this.buildExercisePrompt(request);
    const response = await this.callAIAPI(prompt, 'exercise');
    
    // Parser et valider la réponse
    const exercise = this.parseExerciseResponse(response);
    
    // Mettre en cache
    this.cache.set(cacheKey, exercise);
    
    // Enregistrer dans l'historique
    this.generationHistory.push({
      type: 'exercise',
      timestamp: Date.now(),
      cost: this.estimateCost(prompt.length, response.length)
    });

    return exercise;
  }

  /**
   * Génère un texte adapté
   */
  public async generateText(request: ContentGenerationRequest): Promise<GeneratedText> {
    const cacheKey = this.generateCacheKey('text', request);
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit atteint');
    }

    const prompt = this.buildTextPrompt(request);
    const response = await this.callAIAPI(prompt, 'text');
    
    const text = this.parseTextResponse(response);
    
    this.cache.set(cacheKey, text);
    
    this.generationHistory.push({
      type: 'text',
      timestamp: Date.now(),
      cost: this.estimateCost(prompt.length, response.length)
    });

    return text;
  }

  /**
   * Génère une explication pédagogique
   */
  public async generateExplanation(
    concept: string, 
    level: string, 
    context?: string
  ): Promise<PedagogicalExplanation> {
    const cacheKey = `explanation-${concept}-${level}-${context || 'general'}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit atteint');
    }

    const prompt = this.buildExplanationPrompt(concept, level, context);
    const response = await this.callAIAPI(prompt, 'explanation');
    
    const explanation = this.parseExplanationResponse(response);
    
    this.cache.set(cacheKey, explanation);
    
    this.generationHistory.push({
      type: 'explanation',
      timestamp: Date.now(),
      cost: this.estimateCost(prompt.length, response.length)
    });

    return explanation;
  }

  /**
   * Génère des suggestions de reformulation
   */
  public async generateReformulation(
    original: string, 
    level: string, 
    context?: string
  ): Promise<ReformulationSuggestion[]> {
    const cacheKey = `reformulation-${original}-${level}-${context || 'general'}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.checkRateLimit()) {
      throw new Error('Rate limit atteint');
    }

    const prompt = this.buildReformulationPrompt(original, level, context);
    const response = await this.callAIAPI(prompt, 'reformulation');
    
    const suggestions = this.parseReformulationResponse(response);
    
    this.cache.set(cacheKey, suggestions);
    
    this.generationHistory.push({
      type: 'reformulation',
      timestamp: Date.now(),
      cost: this.estimateCost(prompt.length, response.length)
    });

    return suggestions;
  }

  /**
   * Appelle l'API IA
   */
  private async callAIAPI(prompt: string, type: string): Promise<string> {
    // Essayer OpenAI en premier
    try {
      return await this.callOpenAI(prompt);
    } catch (error) {
      console.error('Erreur OpenAI, tentative Claude:', error);
      try {
        return await this.callClaude(prompt);
      } catch (error) {
        console.error('Erreur Claude:', error);
        throw new Error('Tous les services IA sont indisponibles');
      }
    }
  }

  /**
   * Appelle OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert pédagogique en français. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Appelle Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API Claude non configurée');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Claude: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Construit le prompt pour un exercice
   */
  private buildExercisePrompt(request: ContentGenerationRequest): string {
    const template = CONTENT_GENERATION_PROMPTS.exercise;
    const profile = request.userProfile || {};
    
    return template
      .replace('{level}', request.level)
      .replace('{theme}', request.theme || 'général')
      .replace('{difficulty}', request.difficulty?.toString() || '5')
      .replace('{weakPoints}', profile.weakPoints?.join(', ') || 'aucun')
      .replace('{strongPoints}', profile.strongPoints?.join(', ') || 'aucun')
      .replace('{learningStyle}', profile.learningStyle || 'reading')
      .replace('{exerciseType}', this.determineExerciseType(request));
  }

  /**
   * Construit le prompt pour un texte
   */
  private buildTextPrompt(request: ContentGenerationRequest): string {
    const template = CONTENT_GENERATION_PROMPTS.text;
    
    return template
      .replace('{level}', request.level)
      .replace('{theme}', request.theme || 'général')
      .replace('{length}', request.length?.toString() || '200')
      .replace('{vocabulary}', request.focus?.join(', ') || 'vocabulaire général');
  }

  /**
   * Construit le prompt pour une explication
   */
  private buildExplanationPrompt(concept: string, level: string, context?: string): string {
    const template = CONTENT_GENERATION_PROMPTS.explanation;
    
    return template
      .replace('{concept}', concept)
      .replace('{level}', level)
      .replace('{context}', context || 'général');
  }

  /**
   * Construit le prompt pour une reformulation
   */
  private buildReformulationPrompt(original: string, level: string, context?: string): string {
    const template = CONTENT_GENERATION_PROMPTS.reformulation;
    
    return template
      .replace('{original}', original)
      .replace('{level}', level)
      .replace('{context}', context || 'général');
  }

  /**
   * Détermine le type d'exercice approprié
   */
  private determineExerciseType(request: ContentGenerationRequest): string {
    if (request.focus?.includes('vocabulary')) return 'multiple-choice';
    if (request.focus?.includes('grammar')) return 'fill-blanks';
    if (request.focus?.includes('writing')) return 'writing';
    if (request.level === 'beginner') return 'multiple-choice';
    return 'transformation';
  }

  /**
   * Parse la réponse d'exercice
   */
  private parseExerciseResponse(response: string): GeneratedExercise {
    try {
      const parsed = JSON.parse(response);
      
      // Validation et nettoyage
      return {
        id: parsed.id || `exercise-${Date.now()}`,
        type: parsed.type || 'multiple-choice',
        title: parsed.title || 'Exercice généré',
        description: parsed.description || '',
        content: parsed.content || { questions: [] },
        instructions: parsed.instructions || '',
        difficulty: parsed.difficulty || 5,
        estimatedTime: parsed.estimatedTime || 5,
        learningObjectives: parsed.learningObjectives || [],
        hints: parsed.hints || [],
        solution: parsed.solution || { answers: {}, explanations: {}, score: 0, feedback: '' },
        explanations: parsed.explanations || [],
        relatedTopics: parsed.relatedTopics || []
      };
    } catch (error) {
      console.error('Erreur parsing exercice:', error);
      throw new Error('Format de réponse invalide');
    }
  }

  /**
   * Parse la réponse de texte
   */
  private parseTextResponse(response: string): GeneratedText {
    try {
      const parsed = JSON.parse(response);
      
      return {
        id: parsed.id || `text-${Date.now()}`,
        title: parsed.title || 'Texte généré',
        content: parsed.content || '',
        level: parsed.level || 'intermediate',
        theme: parsed.theme || 'général',
        vocabulary: parsed.vocabulary || [],
        grammarPoints: parsed.grammarPoints || [],
        readingTime: parsed.readingTime || 3,
        comprehensionQuestions: parsed.comprehensionQuestions || [],
        culturalNotes: parsed.culturalNotes || []
      };
    } catch (error) {
      console.error('Erreur parsing texte:', error);
      throw new Error('Format de réponse invalide');
    }
  }

  /**
   * Parse la réponse d'explication
   */
  private parseExplanationResponse(response: string): PedagogicalExplanation {
    try {
      const parsed = JSON.parse(response);
      
      return {
        concept: parsed.concept || '',
        definition: parsed.definition || '',
        examples: parsed.examples || [],
        rules: parsed.rules || [],
        exceptions: parsed.exceptions || [],
        commonMistakes: parsed.commonMistakes || [],
        practiceTips: parsed.practiceTips || [],
        relatedConcepts: parsed.relatedConcepts || [],
        visualAids: parsed.visualAids || []
      };
    } catch (error) {
      console.error('Erreur parsing explication:', error);
      throw new Error('Format de réponse invalide');
    }
  }

  /**
   * Parse la réponse de reformulation
   */
  private parseReformulationResponse(response: string): ReformulationSuggestion[] {
    try {
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        return [parsed];
      }
    } catch (error) {
      console.error('Erreur parsing reformulation:', error);
      throw new Error('Format de réponse invalide');
    }
  }

  /**
   * Vérifie le rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.count = 0;
      this.rateLimiter.resetTime = now + 60000; // Reset toutes les minutes
    }
    
    return this.rateLimiter.count < 30; // Max 30 requêtes par minute
  }

  /**
   * Génère une clé de cache
   */
  private generateCacheKey(type: string, request: ContentGenerationRequest): string {
    return `${type}-${request.level}-${request.theme}-${request.difficulty}-${JSON.stringify(request.focus)}`;
  }

  /**
   * Estime le coût d'une requête
   */
  private estimateCost(inputTokens: number, outputTokens: number): number {
    const totalTokens = inputTokens + outputTokens;
    return (totalTokens / 1000) * 0.002; // Approximation
  }

  /**
   * Obtient les statistiques de génération
   */
  public getGenerationStats(): any {
    const totalCost = this.generationHistory.reduce((sum, item) => sum + item.cost, 0);
    const typeCounts = this.generationHistory.reduce((counts, item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalGenerations: this.generationHistory.length,
      totalCost,
      cacheSize: this.cache.size,
      typeCounts,
      averageCost: totalCost / this.generationHistory.length || 0
    };
  }

  /**
   * Nettoie le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Instance singleton
export const aiContentGenerator = new AIContentGenerator();

// Hook React pour utiliser le générateur de contenu
export const useAIContentGenerator = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [lastGeneration, setLastGeneration] = React.useState<any>(null);

  const generateExercise = React.useCallback(async (request: ContentGenerationRequest) => {
    setIsGenerating(true);
    try {
      const exercise = await aiContentGenerator.generateExercise(request);
      setLastGeneration(exercise);
      return exercise;
    } catch (error) {
      console.error('Erreur génération exercice:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateText = React.useCallback(async (request: ContentGenerationRequest) => {
    setIsGenerating(true);
    try {
      const text = await aiContentGenerator.generateText(request);
      setLastGeneration(text);
      return text;
    } catch (error) {
      console.error('Erreur génération texte:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateExplanation = React.useCallback(async (concept: string, level: string, context?: string) => {
    setIsGenerating(true);
    try {
      const explanation = await aiContentGenerator.generateExplanation(concept, level, context);
      setLastGeneration(explanation);
      return explanation;
    } catch (error) {
      console.error('Erreur génération explication:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateReformulation = React.useCallback(async (original: string, level: string, context?: string) => {
    setIsGenerating(true);
    try {
      const suggestions = await aiContentGenerator.generateReformulation(original, level, context);
      setLastGeneration(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Erreur génération reformulation:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateExercise,
    generateText,
    generateExplanation,
    generateReformulation,
    isGenerating,
    lastGeneration,
    getStats: aiContentGenerator.getGenerationStats.bind(aiContentGenerator),
    clearCache: aiContentGenerator.clearCache.bind(aiContentGenerator)
  };
};

// Import React pour les hooks
import React from 'react';
