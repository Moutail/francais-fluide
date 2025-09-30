import type { Exercise, ExerciseType, Difficulty, UserProfile, GrammarError } from '@/types';

// Types pour le générateur d'exercices
export interface ExerciseTemplate {
  id: string;
  type: ExerciseType;
  name: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: number; // en minutes
  grammarRules: string[];
  generate: (userProfile: UserProfile, difficulty: Difficulty) => Exercise;
}

export interface UserWeaknesses {
  grammarRules: { [ruleId: string]: number }; // score de faiblesse (0-1)
  errorTypes: { [type: string]: number };
  commonMistakes: string[];
  lastErrors: GrammarError[];
}

// Analyse des faiblesses de l'utilisateur
export function analyzeUserWeaknesses(
  userProfile: UserProfile,
  recentErrors: GrammarError[]
): UserWeaknesses {
  const weaknesses: UserWeaknesses = {
    grammarRules: {},
    errorTypes: {},
    commonMistakes: [],
    lastErrors: recentErrors,
  };

  // Analyser les erreurs récentes
  recentErrors.forEach(error => {
    const ruleId = error.id || 'unknown';
    weaknesses.grammarRules[ruleId] = (weaknesses.grammarRules[ruleId] || 0) + 1;

    const category = error.type || 'unknown';
    weaknesses.errorTypes[category] = (weaknesses.errorTypes[category] || 0) + 1;

    if (error.message) {
      weaknesses.commonMistakes.push(error.message);
    }
  });

  // Normaliser les scores
  Object.keys(weaknesses.grammarRules).forEach(rule => {
    weaknesses.grammarRules[rule] = Math.min(1, weaknesses.grammarRules[rule] / 5);
  });

  return weaknesses;
}

// Templates d'exercices
export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // === DICTÉE ===
  {
    id: 'dictation-basic',
    type: 'listening',
    name: 'Dictée de base',
    description: 'Écoutez et écrivez le texte dicté',
    difficulty: 'beginner',
    estimatedTime: 5,
    grammarRules: ['spelling', 'punctuation'],
    generate: (userProfile, difficulty) => ({
      id: `dictation-${Date.now()}`,
      type: 'listening',
      title: 'Dictée de base',
      description: 'Écoutez attentivement et écrivez le texte dicté',
      difficulty,
      estimatedTime: 5,
      content: {
        audioUrl: '/sounds/dictation-basic.mp3',
        text: "Le chat dort paisiblement sur le canapé. Il fait beau aujourd'hui.",
        instructions: 'Écrivez exactement ce que vous entendez.',
      },
      questions: [],
      scoring: {
        maxPoints: 100,
        timeBonus: 20,
        accuracyWeight: 0.8,
      },
    }),
  },

  {
    id: 'dictation-advanced',
    type: 'listening',
    name: 'Dictée avancée',
    description: 'Dictée avec pièges grammaticaux',
    difficulty: 'advanced',
    estimatedTime: 10,
    grammarRules: ['agreement', 'conjugation', 'spelling'],
    generate: (userProfile, difficulty) => ({
      id: `dictation-adv-${Date.now()}`,
      type: 'listening',
      title: 'Dictée avancée',
      description: 'Dictée avec des pièges grammaticaux complexes',
      difficulty,
      estimatedTime: 10,
      content: {
        audioUrl: '/sounds/dictation-advanced.mp3',
        text: "Malgré qu'il ait plu toute la nuit, les fleurs que j'avais plantées hier ont survécu. Elles sont plus belles que jamais.",
        instructions: 'Attention aux accords et à la conjugaison !',
      },
      questions: [],
      scoring: {
        maxPoints: 150,
        timeBonus: 30,
        accuracyWeight: 0.9,
      },
    }),
  },

  // === CORRECTION DE TEXTE ===
  {
    id: 'text-correction-basic',
    type: 'grammar',
    name: 'Correction de texte',
    description: 'Corrigez les erreurs dans le texte',
    difficulty: 'beginner',
    estimatedTime: 8,
    grammarRules: ['spelling', 'punctuation', 'basic-grammar'],
    generate: (userProfile, difficulty) => ({
      id: `correction-${Date.now()}`,
      type: 'grammar',
      title: 'Correction de texte',
      description: 'Trouvez et corrigez les erreurs dans le texte',
      difficulty,
      estimatedTime: 8,
      content: {
        text: 'Le chien et la chatte joue dans le jardin. Ils sont tres content.',
        instructions: 'Cliquez sur les erreurs et proposez des corrections.',
      },
      questions: [
        {
          id: 'q1',
          type: 'correction',
          text: 'Le chien et la chatte joue dans le jardin.',
          correctAnswer: 'Le chien et la chatte jouent dans le jardin.',
          explanation: "Avec plusieurs sujets, le verbe s'accorde au pluriel.",
        },
        {
          id: 'q2',
          type: 'correction',
          text: 'Ils sont tres content.',
          correctAnswer: 'Ils sont très contents.',
          explanation: 'Accord de l\'adjectif avec le sujet pluriel + accent sur "très".',
        },
      ],
      scoring: {
        maxPoints: 100,
        timeBonus: 15,
        accuracyWeight: 0.85,
      },
    }),
  },

  // === CONJUGAISON ===
  {
    id: 'conjugation-present',
    type: 'grammar',
    name: 'Conjugaison au présent',
    description: 'Conjuguez les verbes au présent',
    difficulty: 'beginner',
    estimatedTime: 6,
    grammarRules: ['conjugation', 'present-tense'],
    generate: (userProfile, difficulty) => ({
      id: `conjugation-${Date.now()}`,
      type: 'grammar',
      title: 'Conjugaison au présent',
      description: "Conjuguez les verbes au présent de l'indicatif",
      difficulty,
      estimatedTime: 6,
      content: {
        instructions: 'Conjuguez les verbes entre parenthèses au présent.',
      },
      questions: [
        {
          id: 'q1',
          type: 'fill-blank',
          text: 'Je (manger) une pomme.',
          correctAnswer: 'mange',
          options: ['mange', 'manges', 'mangent'],
          explanation: 'À la 1ère personne du singulier, on utilise "mange".',
        },
        {
          id: 'q2',
          type: 'fill-blank',
          text: 'Nous (finir) nos devoirs.',
          correctAnswer: 'finissons',
          options: ['finis', 'finissons', 'finissent'],
          explanation: 'À la 1ère personne du pluriel, on utilise "finissons".',
        },
      ],
      scoring: {
        maxPoints: 80,
        timeBonus: 10,
        accuracyWeight: 0.9,
      },
    }),
  },

  // === VOCABULAIRE ===
  {
    id: 'vocabulary-synonyms',
    type: 'vocabulary',
    name: 'Synonymes',
    description: 'Trouvez les synonymes des mots',
    difficulty: 'intermediate',
    estimatedTime: 7,
    grammarRules: ['vocabulary', 'semantics'],
    generate: (userProfile, difficulty) => ({
      id: `vocab-${Date.now()}`,
      type: 'vocabulary',
      title: 'Synonymes',
      description: 'Trouvez le synonyme de chaque mot',
      difficulty,
      estimatedTime: 7,
      content: {
        instructions: 'Sélectionnez le synonyme correct pour chaque mot.',
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          text: 'Synonyme de "rapidement"',
          correctAnswer: 'vite',
          options: ['vite', 'lentement', 'doucement', 'fortement'],
          explanation: '"Rapidement" et "vite" expriment la même idée de vitesse.',
        },
      ],
      scoring: {
        maxPoints: 60,
        timeBonus: 8,
        accuracyWeight: 0.95,
      },
    }),
  },

  // === COMPRÉHENSION ===
  {
    id: 'comprehension-reading',
    type: 'comprehension',
    name: 'Compréhension de lecture',
    description: 'Répondez aux questions sur le texte',
    difficulty: 'intermediate',
    estimatedTime: 12,
    grammarRules: ['reading-comprehension', 'inference'],
    generate: (userProfile, difficulty) => ({
      id: `comprehension-${Date.now()}`,
      type: 'comprehension',
      title: 'Compréhension de lecture',
      description: 'Lisez le texte et répondez aux questions',
      difficulty,
      estimatedTime: 12,
      content: {
        text: "La France est un pays d'Europe de l'Ouest. Sa capitale est Paris, une ville célèbre pour ses monuments historiques comme la Tour Eiffel et le Louvre. La France compte environ 67 millions d'habitants.",
        instructions: 'Lisez le texte et répondez aux questions suivantes.',
      },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          text: 'Quelle est la capitale de la France ?',
          correctAnswer: 'Paris',
          options: ['Lyon', 'Paris', 'Marseille', 'Toulouse'],
          explanation: 'Le texte indique clairement que Paris est la capitale de la France.',
        },
      ],
      scoring: {
        maxPoints: 120,
        timeBonus: 25,
        accuracyWeight: 0.8,
      },
    }),
  },
];

// Générateur principal d'exercices adaptatifs
export class AdaptiveExerciseGenerator {
  private templates: ExerciseTemplate[];
  private userWeaknesses: UserWeaknesses;

  constructor(templates: ExerciseTemplate[] = EXERCISE_TEMPLATES) {
    this.templates = templates;
    this.userWeaknesses = {
      grammarRules: {},
      errorTypes: {},
      commonMistakes: [],
      lastErrors: [],
    };
  }

  // Mettre à jour les faiblesses de l'utilisateur
  updateUserWeaknesses(userProfile: UserProfile, recentErrors: GrammarError[]) {
    this.userWeaknesses = analyzeUserWeaknesses(userProfile, recentErrors);
  }

  // Générer un exercice adaptatif
  generateAdaptiveExercise(
    userProfile: UserProfile,
    preferredType?: ExerciseType,
    preferredDifficulty?: Difficulty
  ): Exercise {
    // Filtrer les templates selon les préférences
    let availableTemplates = this.templates;

    if (preferredType) {
      availableTemplates = availableTemplates.filter(t => t.type === preferredType);
    }

    if (preferredDifficulty) {
      availableTemplates = availableTemplates.filter(t => t.difficulty === preferredDifficulty);
    }

    // Si pas de préférences, choisir selon les faiblesses
    if (!preferredType && !preferredDifficulty) {
      availableTemplates = this.selectTemplatesByWeaknesses(availableTemplates);
    }

    // Sélectionner un template aléatoire
    const randomTemplate =
      availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

    if (!randomTemplate) {
      throw new Error("Aucun template d'exercice disponible");
    }

    // Générer l'exercice
    return randomTemplate.generate(userProfile, preferredDifficulty || randomTemplate.difficulty);
  }

  // Sélectionner les templates selon les faiblesses
  private selectTemplatesByWeaknesses(templates: ExerciseTemplate[]): ExerciseTemplate[] {
    const scoredTemplates = templates.map(template => {
      let score = 0;

      // Score basé sur les règles de grammaire faibles
      template.grammarRules.forEach(rule => {
        const weakness = this.userWeaknesses.grammarRules[rule] || 0;
        score += weakness;
      });

      return { template, score };
    });

    // Trier par score décroissant et prendre les meilleurs
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(3, Math.floor(templates.length / 2)))
      .map(item => item.template);
  }

  // Générer une série d'exercices
  generateExerciseSeries(
    userProfile: UserProfile,
    count: number = 5,
    types?: ExerciseType[]
  ): Exercise[] {
    const exercises: Exercise[] = [];
    const availableTypes = types || [
      'grammar',
      'vocabulary',
      'comprehension',
      'listening',
      'writing',
    ];

    for (let i = 0; i < count; i++) {
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const exercise = this.generateAdaptiveExercise(userProfile, randomType);
      exercises.push(exercise);
    }

    return exercises;
  }

  // Obtenir les statistiques de progression
  getProgressStats(
    exercises: Exercise[],
    userAnswers: any[]
  ): {
    totalExercises: number;
    completedExercises: number;
    averageScore: number;
    timeSpent: number;
    weakAreas: string[];
  } {
    const completed = exercises.filter((_, index) => userAnswers[index]);
    const scores = completed.map((_, index) => userAnswers[index]?.score || 0);

    return {
      totalExercises: exercises.length,
      completedExercises: completed.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      timeSpent: completed.reduce((total, exercise) => total + exercise.estimatedTime, 0),
      weakAreas: Object.keys(this.userWeaknesses.grammarRules).filter(
        rule => this.userWeaknesses.grammarRules[rule] > 0.5
      ),
    };
  }
}

// Instance globale du générateur
export const exerciseGenerator = new AdaptiveExerciseGenerator();
