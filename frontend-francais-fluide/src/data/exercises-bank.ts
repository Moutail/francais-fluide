import type { Exercise, ExerciseType, Difficulty } from '@/types';

// Catégories de textes
export const TEXT_CATEGORIES = {
  LITERATURE: 'literature',
  NEWS: 'news',
  PROFESSIONAL: 'professional',
  ACADEMIC: 'academic',
  CONVERSATIONAL: 'conversational'
} as const;

// Pièges grammaticaux courants
export const COMMON_TRAPS = {
  AGREEMENT: 'agreement',
  CONJUGATION: 'conjugation',
  SPELLING: 'spelling',
  PUNCTUATION: 'punctuation',
  HOMOPHONES: 'homophones',
  FALSE_FRIENDS: 'false_friends',
  PLEONASMS: 'pleonasms',
  ANGLICISMS: 'anglicisms'
} as const;

// Banque d'exercices pré-créés
export const EXERCISES_BANK: Exercise[] = [
  // === NIVEAU DÉBUTANT ===
  {
    id: 'beginner-001',
    type: 'grammar',
    title: 'Accords simples',
    description: 'Exercice d\'accords basiques pour débutants',
    difficulty: 'beginner',
    estimatedTime: 5,
    content: {
      text: 'Le chien et la chatte (être) dans le jardin. Ils (jouer) ensemble.',
      instructions: 'Conjuguez les verbes entre parenthèses.'
    },
    questions: [
      {
        id: 'q1',
        type: 'fill-blank',
        text: 'Le chien et la chatte ___ dans le jardin.',
        correctAnswer: 'sont',
        options: ['est', 'sont', 'êtes'],
        explanation: 'Avec plusieurs sujets, le verbe s\'accorde au pluriel.'
      },
      {
        id: 'q2',
        type: 'fill-blank',
        text: 'Ils ___ ensemble.',
        correctAnswer: 'jouent',
        options: ['joue', 'joues', 'jouent'],
        explanation: 'À la 3ème personne du pluriel, on utilise "jouent".'
      }
    ],
    scoring: {
      maxPoints: 100,
      timeBonus: 20,
      accuracyWeight: 0.8
    },
    tags: [COMMON_TRAPS.AGREEMENT, COMMON_TRAPS.CONJUGATION],
    category: TEXT_CATEGORIES.CONVERSATIONAL
  },

  {
    id: 'beginner-002',
    type: 'vocabulary',
    title: 'Homophones courants',
    description: 'Distinguer les homophones de base',
    difficulty: 'beginner',
    estimatedTime: 6,
    content: {
      instructions: 'Choisissez le bon homophone pour chaque phrase.'
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: 'Je vais ___ la maison.',
        correctAnswer: 'à',
        options: ['à', 'a', 'as'],
        explanation: '"À" est une préposition, "a" est le verbe avoir.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Il ___ un chien.',
        correctAnswer: 'a',
        options: ['à', 'a', 'as'],
        explanation: '"A" est la 3ème personne du singulier du verbe avoir.'
      }
    ],
    scoring: {
      maxPoints: 80,
      timeBonus: 15,
      accuracyWeight: 0.9
    },
    tags: [COMMON_TRAPS.HOMOPHONES],
    category: TEXT_CATEGORIES.CONVERSATIONAL
  },

  // === NIVEAU INTERMÉDIAIRE ===
  {
    id: 'intermediate-001',
    type: 'grammar',
    title: 'Subjonctif présent',
    description: 'Maîtrise du subjonctif présent',
    difficulty: 'intermediate',
    estimatedTime: 10,
    content: {
      text: 'Il faut que je (partir) tôt demain. Je veux que tu (venir) avec moi.',
      instructions: 'Conjuguez les verbes au subjonctif présent.'
    },
    questions: [
      {
        id: 'q1',
        type: 'fill-blank',
        text: 'Il faut que je ___ tôt demain.',
        correctAnswer: 'parte',
        options: ['parte', 'partes', 'partent'],
        explanation: 'Après "il faut que", on utilise le subjonctif présent.'
      },
      {
        id: 'q2',
        type: 'fill-blank',
        text: 'Je veux que tu ___ avec moi.',
        correctAnswer: 'viennes',
        options: ['viens', 'viennes', 'viennent'],
        explanation: 'Après "je veux que", on utilise le subjonctif présent.'
      }
    ],
    scoring: {
      maxPoints: 120,
      timeBonus: 25,
      accuracyWeight: 0.85
    },
    tags: [COMMON_TRAPS.CONJUGATION],
    category: TEXT_CATEGORIES.LITERATURE
  },

  {
    id: 'intermediate-002',
    type: 'comprehension',
    title: 'Texte littéraire',
    description: 'Compréhension d\'un extrait littéraire',
    difficulty: 'intermediate',
    estimatedTime: 12,
    content: {
      text: 'Le soleil se couchait derrière les collines, peignant le ciel de couleurs orangées et pourpres. Les ombres s\'allongeaient sur la campagne, créant un paysage mélancolique et poétique. Dans le lointain, on entendait le chant des oiseaux qui regagnaient leurs nids.',
      instructions: 'Lisez le texte et répondez aux questions.'
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: 'Quelle est l\'ambiance générale du texte ?',
        correctAnswer: 'Mélancolique et poétique',
        options: ['Joyeuse et dynamique', 'Mélancolique et poétique', 'Triste et sombre', 'Neutre et factuelle'],
        explanation: 'Le texte évoque une "ambiance mélancolique et poétique".'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Que font les oiseaux dans ce passage ?',
        correctAnswer: 'Ils regagnent leurs nids',
        options: ['Ils chantent joyeusement', 'Ils regagnent leurs nids', 'Ils cherchent de la nourriture', 'Ils volent en formation'],
        explanation: 'Le texte indique que "les oiseaux regagnaient leurs nids".'
      }
    ],
    scoring: {
      maxPoints: 150,
      timeBonus: 30,
      accuracyWeight: 0.8
    },
    tags: [COMMON_TRAPS.SPELLING],
    category: TEXT_CATEGORIES.LITERATURE
  },

  // === NIVEAU AVANCÉ ===
  {
    id: 'advanced-001',
    type: 'grammar',
    title: 'Concordance des temps',
    description: 'Maîtrise de la concordance des temps',
    difficulty: 'advanced',
    estimatedTime: 15,
    content: {
      text: 'Hier, quand je (arriver) à la gare, le train (partir) déjà. Je (être) déçu car j\'avais espéré le prendre.',
      instructions: 'Conjuguez les verbes en respectant la concordance des temps.'
    },
    questions: [
      {
        id: 'q1',
        type: 'fill-blank',
        text: 'Hier, quand je ___ à la gare, le train ___ déjà.',
        correctAnswer: 'suis arrivé, était parti',
        options: ['suis arrivé, était parti', 'arrivais, partait', 'arrivai, partit'],
        explanation: 'Action passée (arriver) + action antérieure (partir) = passé composé + plus-que-parfait.'
      },
      {
        id: 'q2',
        type: 'fill-blank',
        text: 'Je ___ déçu car j\'avais espéré le prendre.',
        correctAnswer: 'étais',
        options: ['étais', 'ai été', 'serais'],
        explanation: 'État dans le passé = imparfait.'
      }
    ],
    scoring: {
      maxPoints: 200,
      timeBonus: 40,
      accuracyWeight: 0.9
    },
    tags: [COMMON_TRAPS.CONJUGATION],
    category: TEXT_CATEGORIES.ACADEMIC
  },

  {
    id: 'advanced-002',
    type: 'writing',
    title: 'Correction de style',
    description: 'Améliorer le style d\'un texte',
    difficulty: 'advanced',
    estimatedTime: 18,
    content: {
      text: 'Au final, j\'ai un problème avec cette situation. Malgré que je sois d\'accord avec toi, je pense qu\'on devrait pallier à ce problème au jour d\'aujourd\'hui.',
      instructions: 'Corrigez les erreurs de style et les anglicismes dans ce texte.'
    },
    questions: [
      {
        id: 'q1',
        type: 'correction',
        text: 'Corrigez "Au final"',
        correctAnswer: 'Finalement',
        explanation: '"Au final" est un anglicisme. Utilisez "finalement" ou "en fin de compte".'
      },
      {
        id: 'q2',
        type: 'correction',
        text: 'Corrigez "Malgré que"',
        correctAnswer: 'Bien que',
        explanation: '"Malgré que" est incorrect. Utilisez "bien que" ou "quoique".'
      },
      {
        id: 'q3',
        type: 'correction',
        text: 'Corrigez "pallier à"',
        correctAnswer: 'pallier',
        explanation: 'On dit "pallier quelque chose" (sans "à").'
      },
      {
        id: 'q4',
        type: 'correction',
        text: 'Corrigez "au jour d\'aujourd\'hui"',
        correctAnswer: 'aujourd\'hui',
        explanation: '"Au jour d\'aujourd\'hui" est un pléonasme. Utilisez simplement "aujourd\'hui".'
      }
    ],
    scoring: {
      maxPoints: 250,
      timeBonus: 50,
      accuracyWeight: 0.85
    },
    tags: [COMMON_TRAPS.ANGLICISMS, COMMON_TRAPS.PLEONASMS],
    category: TEXT_CATEGORIES.PROFESSIONAL
  },

  // === EXERCICES SPÉCIALISÉS ===
  {
    id: 'specialized-001',
    type: 'listening',
    title: 'Dictée professionnelle',
    description: 'Dictée d\'un texte professionnel',
    difficulty: 'intermediate',
    estimatedTime: 8,
    content: {
      audioUrl: '/sounds/dictation-professional.mp3',
      text: 'Notre entreprise souhaite améliorer sa communication interne. Nous prévoyons d\'organiser des formations pour tous les employés afin de renforcer leurs compétences linguistiques.',
      instructions: 'Écrivez exactement ce que vous entendez.'
    },
    questions: [],
    scoring: {
      maxPoints: 120,
      timeBonus: 20,
      accuracyWeight: 0.9
    },
    tags: [COMMON_TRAPS.SPELLING, COMMON_TRAPS.PUNCTUATION],
    category: TEXT_CATEGORIES.PROFESSIONAL
  },

  {
    id: 'specialized-002',
    type: 'comprehension',
    title: 'Article d\'actualité',
    description: 'Compréhension d\'un article de presse',
    difficulty: 'intermediate',
    estimatedTime: 14,
    content: {
      text: 'La France a annoncé hier de nouvelles mesures pour lutter contre le changement climatique. Le gouvernement prévoit d\'investir 15 milliards d\'euros dans les énergies renouvelables d\'ici 2030. Cette décision s\'inscrit dans le cadre de l\'Accord de Paris sur le climat.',
      instructions: 'Lisez l\'article et répondez aux questions.'
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: 'Quel est le montant de l\'investissement prévu ?',
        correctAnswer: '15 milliards d\'euros',
        options: ['10 milliards d\'euros', '15 milliards d\'euros', '20 milliards d\'euros', '25 milliards d\'euros'],
        explanation: 'Le texte mentionne "15 milliards d\'euros".'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Quel accord international est mentionné ?',
        correctAnswer: 'L\'Accord de Paris',
        options: ['L\'Accord de Kyoto', 'L\'Accord de Paris', 'L\'Accord de Copenhague', 'L\'Accord de Glasgow'],
        explanation: 'Le texte fait référence à "l\'Accord de Paris sur le climat".'
      }
    ],
    scoring: {
      maxPoints: 180,
      timeBonus: 35,
      accuracyWeight: 0.8
    },
    tags: [COMMON_TRAPS.SPELLING],
    category: TEXT_CATEGORIES.NEWS
  }
];

// Fonctions utilitaires pour la banque d'exercices
export class ExerciseBank {
  private exercises: Exercise[];

  constructor(exercises: Exercise[] = EXERCISES_BANK) {
    this.exercises = exercises;
  }

  // Filtrer par niveau de difficulté
  getByDifficulty(difficulty: Difficulty): Exercise[] {
    return this.exercises.filter(ex => ex.difficulty === difficulty);
  }

  // Filtrer par type d'exercice
  getByType(type: ExerciseType): Exercise[] {
    return this.exercises.filter(ex => ex.type === type);
  }

  // Filtrer par catégorie de texte
  getByCategory(category: string): Exercise[] {
    return this.exercises.filter(ex => ex.category === category);
  }

  // Filtrer par pièges grammaticaux
  getByTrap(trap: string): Exercise[] {
    return this.exercises.filter(ex => ex.tags?.includes(trap));
  }

  // Obtenir un exercice aléatoire
  getRandom(difficulty?: Difficulty, type?: ExerciseType): Exercise {
    let filtered = this.exercises;
    
    if (difficulty) {
      filtered = filtered.filter(ex => ex.difficulty === difficulty);
    }
    
    if (type) {
      filtered = filtered.filter(ex => ex.type === type);
    }
    
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // Obtenir une série d'exercices
  getSeries(count: number, difficulty?: Difficulty, type?: ExerciseType): Exercise[] {
    const series: Exercise[] = [];
    const available = this.exercises.filter(ex => 
      (!difficulty || ex.difficulty === difficulty) &&
      (!type || ex.type === type)
    );
    
    for (let i = 0; i < count && i < available.length; i++) {
      series.push(available[i]);
    }
    
    return series;
  }

  // Rechercher des exercices
  search(query: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return this.exercises.filter(ex => 
      ex.title.toLowerCase().includes(lowerQuery) ||
      ex.description.toLowerCase().includes(lowerQuery) ||
      ex.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Obtenir les statistiques
  getStats(): {
    total: number;
    byDifficulty: { [key in Difficulty]: number };
    byType: { [key in ExerciseType]: number };
    byCategory: { [key: string]: number };
  } {
    const stats = {
      total: this.exercises.length,
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      } as { [key in Difficulty]: number },
      byType: {
        grammar: 0,
        vocabulary: 0,
        writing: 0,
        comprehension: 0,
        listening: 0
      } as { [key in ExerciseType]: number },
      byCategory: {} as { [key: string]: number }
    };

    this.exercises.forEach(ex => {
      stats.byDifficulty[ex.difficulty]++;
      stats.byType[ex.type]++;
      
      if (ex.category) {
        stats.byCategory[ex.category] = (stats.byCategory[ex.category] || 0) + 1;
      }
    });

    return stats;
  }
}

// Instance globale de la banque d'exercices
export const exerciseBank = new ExerciseBank();
