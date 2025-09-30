// src/lib/ai/advanced-corrections.ts
import { SUBSCRIPTION_PLANS } from '@/lib/subscription/plans';

export interface AdvancedCorrection {
  id: string;
  type: 'grammar' | 'spelling' | 'style' | 'vocabulary' | 'punctuation';
  severity: 'error' | 'warning' | 'suggestion';
  position: {
    start: number;
    end: number;
  };
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number; // 0-1
  alternatives?: string[];
  context?: string;
  learningTip?: string;
  relatedRules?: string[];
}

export interface UserProfile {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weakPoints: string[];
  strongPoints: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  recentErrors: string[];
  progressHistory: {
    date: string;
    accuracy: number;
    errorsCount: number;
    timeSpent: number;
  }[];
}

export interface CorrectionContext {
  text: string;
  userProfile: UserProfile;
  subscriptionPlan: string;
  exerciseType?: 'dictation' | 'free_writing' | 'grammar' | 'vocabulary';
  timeSpent?: number;
  previousCorrections?: AdvancedCorrection[];
}

export class AdvancedCorrectionEngine {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Analyse un texte et retourne des corrections avancées
   */
  async analyzeText(context: CorrectionContext): Promise<AdvancedCorrection[]> {
    try {
      const prompt = this.buildAnalysisPrompt(context);
      const response = await this.callOpenAI(prompt, context);
      return this.parseCorrections(response, context);
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      return this.getFallbackCorrections(context);
    }
  }

  /**
   * Génère des exercices personnalisés basés sur les erreurs de l'utilisateur
   */
  async generatePersonalizedExercises(
    userProfile: UserProfile,
    subscriptionPlan: string,
    count: number = 5
  ): Promise<
    Array<{
      id: string;
      type: string;
      title: string;
      content: string;
      difficulty: string;
      targetSkills: string[];
    }>
  > {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionPlan);
    const maxExercises = plan?.limits.exercisesPerDay || 3;

    if (count > maxExercises) {
      count = maxExercises;
    }

    try {
      const prompt = this.buildExerciseGenerationPrompt(userProfile, count);
      const response = await this.callOpenAI(prompt, { userProfile, subscriptionPlan });
      return this.parseExercises(response);
    } catch (error) {
      console.error("Erreur lors de la génération d'exercices:", error);
      return this.getFallbackExercises(userProfile, count);
    }
  }

  /**
   * Fournit des explications pédagogiques adaptées au niveau de l'utilisateur
   */
  async getEducationalExplanation(
    error: AdvancedCorrection,
    userProfile: UserProfile
  ): Promise<{
    explanation: string;
    examples: string[];
    practiceTips: string[];
    relatedConcepts: string[];
  }> {
    try {
      const prompt = this.buildExplanationPrompt(error, userProfile);
      const response = await this.callOpenAI(prompt, { error, userProfile });
      return this.parseExplanation(response);
    } catch (e) {
      console.error("Erreur lors de la génération d'explication:", e);
      // Passer null car le paramètre attendu est AdvancedCorrection | null
      return this.getFallbackExplanation(null, userProfile);
    }
  }

  /**
   * Analyse le niveau de l'utilisateur et suggère des améliorations
   */
  async analyzeUserLevel(
    recentTexts: string[],
    errorHistory: AdvancedCorrection[]
  ): Promise<{
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    progress: number; // 0-100
    recommendations: string[];
    nextGoals: string[];
  }> {
    try {
      const prompt = this.buildLevelAnalysisPrompt(recentTexts, errorHistory);
      const response = await this.callOpenAI(prompt, { recentTexts, errorHistory });
      return this.parseLevelAnalysis(response);
    } catch (error) {
      console.error("Erreur lors de l'analyse de niveau:", error);
      return this.getFallbackLevelAnalysis();
    }
  }

  private buildAnalysisPrompt(context: CorrectionContext): string {
    const { text, userProfile, subscriptionPlan, exerciseType } = context;

    return `Tu es un expert en français et un tuteur pédagogique. Analyse ce texte en français et fournis des corrections détaillées.

CONTEXTE UTILISATEUR:
- Niveau: ${userProfile.level}
- Points faibles: ${userProfile.weakPoints.join(', ')}
- Style d'apprentissage: ${userProfile.learningStyle}
- Type d'exercice: ${exerciseType || 'général'}

TEXTE À ANALYSER:
"${text}"

INSTRUCTIONS:
1. Identifie TOUTES les erreurs (grammaire, orthographe, style, ponctuation)
2. Pour chaque erreur, fournis:
   - Type d'erreur
   - Position exacte (caractères)
   - Texte original et suggestion
   - Explication pédagogique adaptée au niveau ${userProfile.level}
   - Conseil d'apprentissage
   - Règles grammaticales liées
3. Adapte le niveau de détail selon le plan d'abonnement: ${subscriptionPlan}
4. Priorise les erreurs les plus importantes pour l'apprentissage

RÉPONSE ATTENDUE (JSON):
{
  "corrections": [
    {
      "type": "grammar|spelling|style|vocabulary|punctuation",
      "severity": "error|warning|suggestion",
      "position": {"start": 0, "end": 5},
      "originalText": "texte original",
      "suggestedText": "texte corrigé",
      "explanation": "explication pédagogique",
      "confidence": 0.95,
      "alternatives": ["alt1", "alt2"],
      "learningTip": "conseil d'apprentissage",
      "relatedRules": ["règle1", "règle2"]
    }
  ]
}`;
  }

  private buildExerciseGenerationPrompt(userProfile: UserProfile, count: number): string {
    return `Tu es un expert en pédagogie du français. Génère ${count} exercices personnalisés pour cet utilisateur.

PROFIL UTILISATEUR:
- Niveau: ${userProfile.level}
- Points faibles: ${userProfile.weakPoints.join(', ')}
- Points forts: ${userProfile.strongPoints.join(', ')}
- Style d'apprentissage: ${userProfile.learningStyle}
- Erreurs récentes: ${userProfile.recentErrors.join(', ')}

INSTRUCTIONS:
1. Crée des exercices qui ciblent spécifiquement les points faibles
2. Adapte la difficulté au niveau ${userProfile.level}
3. Varie les types d'exercices (QCM, texte à trous, rédaction, etc.)
4. Inclus des éléments visuels/auditifs selon le style d'apprentissage
5. Propose des exercices progressifs

RÉPONSE ATTENDUE (JSON):
{
  "exercises": [
    {
      "id": "ex_1",
      "type": "grammar|vocabulary|conjugation|comprehension",
      "title": "Titre de l'exercice",
      "content": "Contenu détaillé de l'exercice",
      "difficulty": "beginner|intermediate|advanced",
      "targetSkills": ["compétence1", "compétence2"],
      "estimatedTime": 5,
      "instructions": "Instructions claires"
    }
  ]
}`;
  }

  private buildExplanationPrompt(error: AdvancedCorrection, userProfile: UserProfile): string {
    return `Tu es un tuteur de français. Explique cette erreur de manière pédagogique et adaptée.

ERREUR:
- Type: ${error.type}
- Texte original: "${error.originalText}"
- Texte suggéré: "${error.suggestedText}"
- Explication actuelle: "${error.explanation}"

PROFIL UTILISATEUR:
- Niveau: ${userProfile.level}
- Style d'apprentissage: ${userProfile.learningStyle}

INSTRUCTIONS:
1. Explique l'erreur de manière claire et simple
2. Donne des exemples concrets adaptés au niveau
3. Propose des conseils pratiques pour éviter cette erreur
4. Lie à des concepts plus larges si approprié
5. Adapte le style selon ${userProfile.learningStyle}

RÉPONSE ATTENDUE (JSON):
{
  "explanation": "Explication détaillée et pédagogique",
  "examples": ["exemple1", "exemple2", "exemple3"],
  "practiceTips": ["conseil1", "conseil2"],
  "relatedConcepts": ["concept1", "concept2"]
}`;
  }

  private buildLevelAnalysisPrompt(
    recentTexts: string[],
    errorHistory: AdvancedCorrection[]
  ): string {
    return `Analyse le niveau de français de cet utilisateur basé sur ses textes récents et son historique d'erreurs.

TEXTES RÉCENTS (${recentTexts.length}):
${recentTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

HISTORIQUE D'ERREURS (${errorHistory.length}):
${errorHistory.map((error, i) => `${i + 1}. ${error.type}: "${error.originalText}" → "${error.suggestedText}"`).join('\n')}

INSTRUCTIONS:
1. Évalue le niveau actuel (beginner/intermediate/advanced)
2. Calcule un pourcentage de progression (0-100)
3. Identifie les forces et faiblesses
4. Propose des recommandations spécifiques
5. Définis des objectifs pour la progression

RÉPONSE ATTENDUE (JSON):
{
  "currentLevel": "beginner|intermediate|advanced",
  "progress": 75,
  "strengths": ["force1", "force2"],
  "weaknesses": ["faiblesse1", "faiblesse2"],
  "recommendations": ["recommandation1", "recommandation2"],
  "nextGoals": ["objectif1", "objectif2"]
}`;
  }

  private async callOpenAI(prompt: string, context: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un expert en français et un tuteur pédagogique. Réponds toujours en JSON valide.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseCorrections(response: string, context: CorrectionContext): AdvancedCorrection[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.corrections || [];
    } catch (error) {
      console.error('Erreur parsing corrections:', error);
      return this.getFallbackCorrections(context);
    }
  }

  private parseExercises(response: string): Array<any> {
    try {
      const parsed = JSON.parse(response);
      return parsed.exercises || [];
    } catch (error) {
      console.error('Erreur parsing exercises:', error);
      return [];
    }
  }

  private parseExplanation(response: string): any {
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Erreur parsing explanation:', error);
      return this.getFallbackExplanation(null, null);
    }
  }

  private parseLevelAnalysis(response: string): any {
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Erreur parsing level analysis:', error);
      return this.getFallbackLevelAnalysis();
    }
  }

  // Méthodes de fallback en cas d'erreur API
  private getFallbackCorrections(context: CorrectionContext): AdvancedCorrection[] {
    // Corrections basiques sans IA
    return [];
  }

  private getFallbackExercises(userProfile: UserProfile, count: number): Array<any> {
    // Exercices prédéfinis
    return [];
  }

  private getFallbackExplanation(
    error: AdvancedCorrection | null,
    userProfile: UserProfile | null
  ): any {
    return {
      explanation: 'Explication non disponible',
      examples: [],
      practiceTips: [],
      relatedConcepts: [],
    };
  }

  private getFallbackLevelAnalysis(): any {
    return {
      currentLevel: 'beginner',
      progress: 0,
      recommendations: [],
      nextGoals: [],
    };
  }
}

// Hook React pour utiliser l'engine de correction
export function useAdvancedCorrections(apiKey: string) {
  const engine = new AdvancedCorrectionEngine(apiKey);

  const analyzeText = async (context: CorrectionContext) => {
    return await engine.analyzeText(context);
  };

  const generateExercises = async (
    userProfile: UserProfile,
    subscriptionPlan: string,
    count: number
  ) => {
    return await engine.generatePersonalizedExercises(userProfile, subscriptionPlan, count);
  };

  const getExplanation = async (error: AdvancedCorrection, userProfile: UserProfile) => {
    return await engine.getEducationalExplanation(error, userProfile);
  };

  const analyzeLevel = async (recentTexts: string[], errorHistory: AdvancedCorrection[]) => {
    return await engine.analyzeUserLevel(recentTexts, errorHistory);
  };

  return {
    analyzeText,
    generateExercises,
    getExplanation,
    analyzeLevel,
  };
}
