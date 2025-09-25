// src/services/dissertationService.js
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DissertationService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;
    
    this.provider = process.env.AI_PROVIDER || 'openai';
  }

  // Types de dissertations supportés
  getDissertationTypes() {
    return [
      {
        id: 'argumentative',
        name: 'Dissertation Argumentative',
        description: 'Défendre une thèse avec des arguments structurés',
        structure: ['Introduction', 'Thèse', 'Antithèse', 'Synthèse', 'Conclusion'],
        examples: [
          'Les réseaux sociaux sont-ils un danger pour la démocratie ?',
          'La technologie améliore-t-elle vraiment notre qualité de vie ?',
          'L\'art doit-il avoir une fonction sociale ?'
        ]
      },
      {
        id: 'comparative',
        name: 'Dissertation Comparative',
        description: 'Comparer deux éléments, œuvres ou concepts',
        structure: ['Introduction', 'Similitudes', 'Différences', 'Analyse', 'Conclusion'],
        examples: [
          'Comparez les styles de Victor Hugo et Charles Baudelaire',
          'Molière et Corneille : deux visions du théâtre',
          'Romantisme vs Réalisme en littérature française'
        ]
      },
      {
        id: 'explicative',
        name: 'Dissertation Explicative',
        description: 'Expliquer et analyser un phénomène ou concept',
        structure: ['Introduction', 'Définition', 'Causes', 'Conséquences', 'Conclusion'],
        examples: [
          'Expliquez l\'évolution de la langue française',
          'Les causes de la Révolution française',
          'L\'impact de l\'imprimerie sur la société'
        ]
      },
      {
        id: 'poetique',
        name: 'Analyse Poétique',
        description: 'Analyser la forme et le fond d\'un poème',
        structure: ['Introduction', 'Analyse formelle', 'Analyse thématique', 'Style', 'Conclusion'],
        examples: [
          'Analysez "Le Dormeur du Val" de Rimbaud',
          'La mélancolie dans "L\'Automne" de Verlaine',
          'Symbolisme et réalité chez Baudelaire'
        ]
      },
      {
        id: 'creative',
        name: 'Rédaction Créative',
        description: 'Écriture créative avec guidance structurée',
        structure: ['Inspiration', 'Plan', 'Développement', 'Révision', 'Finalisation'],
        examples: [
          'Rédigez une nouvelle fantastique',
          'Écrivez un monologue théâtral',
          'Composez un poème en alexandrins'
        ]
      }
    ];
  }

  // Générer un plan de dissertation
  async generatePlan(type, subject, level = 'intermediate') {
    try {
      const dissertationType = this.getDissertationTypes().find(t => t.id === type);
      if (!dissertationType) {
        throw new Error('Type de dissertation non supporté');
      }

      const prompt = this.buildPlanPrompt(dissertationType, subject, level);
      
      if (this.provider === 'anthropic' && this.anthropic) {
        return await this.generatePlanWithAnthropic(prompt, dissertationType);
      } else if (this.openai) {
        return await this.generatePlanWithOpenAI(prompt, dissertationType);
      }
      
      return this.generateBasicPlan(dissertationType, subject);

    } catch (error) {
      console.error('Erreur génération plan:', error);
      throw error;
    }
  }

  buildPlanPrompt(dissertationType, subject, level) {
    const levelGuidance = {
      beginner: 'Utilisez un vocabulaire simple et des phrases courtes. Donnez des exemples concrets.',
      intermediate: 'Utilisez un vocabulaire riche et des structures variées. Développez les arguments.',
      advanced: 'Utilisez un style soutenu et des références culturelles. Analysez en profondeur.'
    };

    return `Vous êtes un professeur de français expert en dissertation. 

MISSION: Créer un plan détaillé pour une ${dissertationType.name.toLowerCase()} sur le sujet: "${subject}"

NIVEAU: ${level} - ${levelGuidance[level]}

STRUCTURE ATTENDUE: ${dissertationType.structure.join(' → ')}

INSTRUCTIONS:
1. Créez un plan détaillé avec des sous-parties
2. Proposez des arguments et exemples pour chaque partie
3. Suggérez des transitions entre les parties
4. Adaptez le niveau de complexité au niveau ${level}
5. Incluez des références littéraires appropriées si pertinent

FORMAT DE RÉPONSE (JSON):
{
  "title": "Titre de la dissertation",
  "introduction": {
    "accroche": "Phrase d'accroche",
    "contextualisation": "Mise en contexte du sujet",
    "problematique": "Question centrale",
    "annonce_plan": "Annonce du plan"
  },
  "plan": [
    {
      "partie": "I. Titre de la première partie",
      "sous_parties": [
        {
          "titre": "A. Sous-partie",
          "arguments": ["Argument 1", "Argument 2"],
          "exemples": ["Exemple 1", "Exemple 2"],
          "transition": "Phrase de transition"
        }
      ]
    }
  ],
  "conclusion": {
    "synthese": "Synthèse des arguments",
    "ouverture": "Question ou perspective d'ouverture"
  },
  "conseils": [
    "Conseil de rédaction 1",
    "Conseil de rédaction 2"
  ]
}

Répondez UNIQUEMENT avec le JSON valide.`;
  }

  async generatePlanWithOpenAI(prompt, dissertationType) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    
    try {
      const plan = JSON.parse(content);
      return {
        ...plan,
        type: dissertationType.id,
        structure: dissertationType.structure,
        generated_by: 'openai',
        tokens_used: response.usage?.total_tokens || 0
      };
    } catch (parseError) {
      console.error('Erreur parsing plan OpenAI:', parseError);
      return this.generateBasicPlan(dissertationType, subject);
    }
  }

  async generatePlanWithAnthropic(prompt, dissertationType) {
    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0].text;
    
    try {
      const plan = JSON.parse(content);
      return {
        ...plan,
        type: dissertationType.id,
        structure: dissertationType.structure,
        generated_by: 'anthropic',
        tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0
      };
    } catch (parseError) {
      console.error('Erreur parsing plan Anthropic:', parseError);
      return this.generateBasicPlan(dissertationType, subject);
    }
  }

  generateBasicPlan(dissertationType, subject) {
    // Plan de base quand l'IA n'est pas disponible
    const basicPlans = {
      argumentative: {
        title: `${subject} - Plan argumentatif`,
        introduction: {
          accroche: "Phrase d'accroche à développer",
          contextualisation: "Contexte du sujet à préciser",
          problematique: "Problématique à formuler",
          annonce_plan: "Plan en trois parties"
        },
        plan: [
          {
            partie: "I. Arguments en faveur",
            sous_parties: [
              {
                titre: "A. Premier argument",
                arguments: ["Argument à développer"],
                exemples: ["Exemple à trouver"],
                transition: "Transition vers B"
              }
            ]
          },
          {
            partie: "II. Arguments contre",
            sous_parties: [
              {
                titre: "A. Contre-argument principal",
                arguments: ["Contre-argument à développer"],
                exemples: ["Contre-exemple à trouver"],
                transition: "Transition vers la synthèse"
              }
            ]
          },
          {
            partie: "III. Synthèse et dépassement",
            sous_parties: [
              {
                titre: "A. Position nuancée",
                arguments: ["Synthèse des positions"],
                exemples: ["Exemple de compromis"],
                transition: "Vers la conclusion"
              }
            ]
          }
        ],
        conclusion: {
          synthese: "Synthèse des arguments développés",
          ouverture: "Question d'ouverture vers un sujet connexe"
        },
        conseils: [
          "Développez chaque argument avec des exemples précis",
          "Soignez les transitions entre les parties",
          "Utilisez un vocabulaire varié et précis"
        ]
      }
    };

    return {
      ...basicPlans[dissertationType.id] || basicPlans.argumentative,
      type: dissertationType.id,
      structure: dissertationType.structure,
      generated_by: 'fallback'
    };
  }

  // Analyser et corriger une dissertation
  async analyzeDissertation(text, type, subject, options = {}) {
    try {
      const {
        checkStructure = true,
        checkStyle = true,
        checkArguments = true,
        level = 'intermediate'
      } = options;

      const dissertationType = this.getDissertationTypes().find(t => t.id === type);
      if (!dissertationType) {
        throw new Error('Type de dissertation non supporté');
      }

      const prompt = this.buildAnalysisPrompt(text, dissertationType, subject, level, {
        checkStructure,
        checkStyle,
        checkArguments
      });

      if (this.provider === 'anthropic' && this.anthropic) {
        return await this.analyzeWithAnthropic(prompt);
      } else if (this.openai) {
        return await this.analyzeWithOpenAI(prompt);
      }
      
      return this.generateBasicAnalysis(text, dissertationType);

    } catch (error) {
      console.error('Erreur analyse dissertation:', error);
      throw error;
    }
  }

  buildAnalysisPrompt(text, dissertationType, subject, level, options) {
    return `Vous êtes un professeur de français expert en correction de dissertations.

MISSION: Analyser et corriger cette ${dissertationType.name.toLowerCase()} sur le sujet: "${subject}"

NIVEAU: ${level}

TEXTE À ANALYSER:
"""
${text}
"""

CRITÈRES D'ANALYSE:
${options.checkStructure ? '✅ Structure et organisation' : '❌ Structure (ignorée)'}
${options.checkStyle ? '✅ Style et expression' : '❌ Style (ignoré)'}
${options.checkArguments ? '✅ Qualité des arguments' : '❌ Arguments (ignorés)'}

STRUCTURE ATTENDUE: ${dissertationType.structure.join(' → ')}

FORMAT DE RÉPONSE (JSON):
{
  "score_global": 85,
  "scores_detailles": {
    "structure": 80,
    "style": 90,
    "arguments": 85,
    "originalite": 75
  },
  "points_forts": [
    "Point fort 1",
    "Point fort 2"
  ],
  "points_amelioration": [
    "Point à améliorer 1",
    "Point à améliorer 2"
  ],
  "corrections": [
    {
      "position": 45,
      "length": 8,
      "texte_original": "text incorrect",
      "correction": "texte correct",
      "type": "orthographe",
      "explication": "Explication de la correction"
    }
  ],
  "suggestions_structure": [
    "Suggestion 1 pour améliorer la structure",
    "Suggestion 2"
  ],
  "suggestions_style": [
    "Suggestion 1 pour améliorer le style",
    "Suggestion 2"
  ],
  "suggestions_arguments": [
    "Suggestion 1 pour renforcer les arguments",
    "Suggestion 2"
  ],
  "feedback_personnalise": "Feedback détaillé et encourageant adapté au niveau de l'étudiant",
  "prochaines_etapes": [
    "Étape 1 pour progresser",
    "Étape 2 pour progresser"
  ]
}

Répondez UNIQUEMENT avec le JSON valide.`;
  }

  async analyzeWithOpenAI(prompt) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(content);
      return {
        ...analysis,
        analyzed_by: 'openai',
        tokens_used: response.usage?.total_tokens || 0,
        analyzed_at: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Erreur parsing analyse OpenAI:', parseError);
      throw new Error('Erreur de traitement de l\'analyse IA');
    }
  }

  async analyzeWithAnthropic(prompt) {
    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.content[0].text;
    
    try {
      const analysis = JSON.parse(content);
      return {
        ...analysis,
        analyzed_by: 'anthropic',
        tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0,
        analyzed_at: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Erreur parsing analyse Anthropic:', parseError);
      throw new Error('Erreur de traitement de l\'analyse IA');
    }
  }

  generateBasicAnalysis(text, dissertationType) {
    const wordCount = text.split(/\s+/).length;
    const paragraphCount = text.split(/\n\s*\n/).length;
    
    return {
      score_global: 70,
      scores_detailles: {
        structure: 65,
        style: 70,
        arguments: 75,
        originalite: 70
      },
      points_forts: [
        "Texte structuré en paragraphes",
        "Longueur appropriée pour le sujet"
      ],
      points_amelioration: [
        "Développer davantage les arguments",
        "Améliorer les transitions entre les parties",
        "Enrichir le vocabulaire"
      ],
      corrections: [],
      suggestions_structure: [
        "Assurez-vous que chaque partie correspond à la structure attendue",
        "Développez l'introduction et la conclusion"
      ],
      suggestions_style: [
        "Variez la longueur des phrases",
        "Utilisez des connecteurs logiques",
        "Évitez les répétitions"
      ],
      suggestions_arguments: [
        "Appuyez vos arguments sur des exemples précis",
        "Anticipez les objections possibles",
        "Hiérarchisez vos arguments du plus faible au plus fort"
      ],
      feedback_personnalise: `Votre dissertation de ${wordCount} mots montre une bonne compréhension du sujet. Continuez à travailler sur la structure et l'argumentation pour atteindre l'excellence.`,
      prochaines_etapes: [
        "Relire et corriger les erreurs identifiées",
        "Enrichir les arguments avec des exemples",
        "Travailler les transitions entre les parties"
      ],
      analyzed_by: 'fallback',
      analyzed_at: new Date().toISOString(),
      statistics: {
        word_count: wordCount,
        paragraph_count: paragraphCount,
        estimated_reading_time: Math.ceil(wordCount / 200) // minutes
      }
    };
  }

  // Générer des exercices d'entraînement
  async generateTrainingExercises(type, level = 'intermediate', count = 5) {
    try {
      const dissertationType = this.getDissertationTypes().find(t => t.id === type);
      if (!dissertationType) {
        throw new Error('Type de dissertation non supporté');
      }

      const prompt = `Générez ${count} sujets d'entraînement pour des ${dissertationType.name.toLowerCase()}s de niveau ${level}.

CRITÈRES:
- Sujets adaptés au niveau ${level}
- Variété dans les thèmes (littérature, société, philosophie, histoire)
- Formulation claire et précise
- Difficulté progressive

FORMAT JSON:
{
  "exercises": [
    {
      "id": 1,
      "subject": "Sujet de dissertation",
      "theme": "littérature/société/philosophie/histoire",
      "difficulty": "easy/medium/hard",
      "estimated_time": 180,
      "keywords": ["mot-clé1", "mot-clé2"],
      "guidance": "Conseil spécifique pour ce sujet"
    }
  ]
}`;

      if (this.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        });
        
        try {
          return JSON.parse(response.content[0].text);
        } catch {
          return this.generateBasicExercises(dissertationType, count);
        }
      } else if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.8
        });
        
        try {
          return JSON.parse(response.choices[0].message.content);
        } catch {
          return this.generateBasicExercises(dissertationType, count);
        }
      }
      
      return this.generateBasicExercises(dissertationType, count);

    } catch (error) {
      console.error('Erreur génération exercices:', error);
      return this.generateBasicExercises(dissertationType, count);
    }
  }

  generateBasicExercises(dissertationType, count) {
    const basicExercises = {
      argumentative: [
        "Les réseaux sociaux sont-ils un danger pour la démocratie ?",
        "La technologie améliore-t-elle vraiment notre qualité de vie ?",
        "L'art doit-il avoir une fonction sociale ?",
        "L'école doit-elle s'adapter aux nouvelles technologies ?",
        "La mondialisation est-elle une chance ou un danger ?"
      ],
      comparative: [
        "Comparez les styles de Victor Hugo et Charles Baudelaire",
        "Molière et Corneille : deux visions du théâtre",
        "Romantisme vs Réalisme en littérature française",
        "Paris et Londres au XIXe siècle : deux capitales, deux modèles",
        "Comparez l'approche de l'amour chez Racine et Corneille"
      ],
      explicative: [
        "Expliquez l'évolution de la langue française",
        "Les causes de la Révolution française",
        "L'impact de l'imprimerie sur la société",
        "L'importance du théâtre au XVIIe siècle",
        "L'influence de la littérature sur la société"
      ],
      poetique: [
        "Analysez 'Le Dormeur du Val' de Rimbaud",
        "La mélancolie dans 'L'Automne' de Verlaine",
        "Symbolisme et réalité chez Baudelaire",
        "L'expression du temps chez Lamartine",
        "La nature dans la poésie romantique"
      ],
      creative: [
        "Rédigez une nouvelle fantastique",
        "Écrivez un monologue théâtral",
        "Composez un poème en alexandrins",
        "Créez un dialogue philosophique",
        "Rédigez une lettre du XVIIIe siècle"
      ]
    };

    const subjects = basicExercises[dissertationType.id] || basicExercises.argumentative;
    
    return {
      exercises: subjects.slice(0, count).map((subject, index) => ({
        id: index + 1,
        subject,
        theme: 'littérature',
        difficulty: 'medium',
        estimated_time: 180,
        keywords: [],
        guidance: `Suivez la structure ${dissertationType.structure.join(' → ')}`
      }))
    };
  }

  // Suivre la progression de l'utilisateur
  async trackDissertationProgress(userId, type, subject, analysis) {
    try {
      // Enregistrer dans les logs d'usage
      await prisma.usageLog.create({
        data: {
          userId,
          type: 'dissertation_analysis',
          details: JSON.stringify({
            dissertation_type: type,
            subject,
            score: analysis.score_global,
            word_count: analysis.statistics?.word_count || 0,
            time_spent: analysis.time_spent || 0,
            analyzed_by: analysis.analyzed_by
          })
        }
      });

      // Mettre à jour la progression utilisateur
      const userProgress = await prisma.userProgress.findUnique({
        where: { userId }
      });

      if (userProgress) {
        const newXP = Math.round(analysis.score_global / 10) * 5; // 5 XP par tranche de 10 points
        
        await prisma.userProgress.update({
          where: { userId },
          data: {
            xp: { increment: newXP },
            wordsWritten: { increment: analysis.statistics?.word_count || 0 },
            lastActivity: new Date()
          }
        });
      }

    } catch (error) {
      console.error('Erreur tracking progression:', error);
      // Ne pas faire échouer la requête principale
    }
  }

  // Obtenir les statistiques de progression en dissertation
  async getDissertationStats(userId, period = 30) {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - period);

      const logs = await prisma.usageLog.findMany({
        where: {
          userId,
          type: 'dissertation_analysis',
          createdAt: { gte: daysAgo }
        },
        orderBy: { createdAt: 'desc' }
      });

      const analyses = logs.map(log => {
        try {
          return JSON.parse(log.details || '{}');
        } catch {
          return null;
        }
      }).filter(Boolean);

      const byType = analyses.reduce((acc, analysis) => {
        const type = analysis.dissertation_type;
        if (!acc[type]) {
          acc[type] = { count: 0, totalScore: 0, averageScore: 0 };
        }
        acc[type].count++;
        acc[type].totalScore += analysis.score;
        acc[type].averageScore = Math.round(acc[type].totalScore / acc[type].count);
        return acc;
      }, {});

      const averageScore = analyses.length > 0 ?
        Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0;

      return {
        total_analyses: analyses.length,
        average_score: averageScore,
        by_type: byType,
        recent_analyses: analyses.slice(0, 10),
        progression: analyses.length >= 2 ? 
          analyses[0].score - analyses[analyses.length - 1].score : 0
      };

    } catch (error) {
      console.error('Erreur récupération stats dissertation:', error);
      return {
        total_analyses: 0,
        average_score: 0,
        by_type: {},
        recent_analyses: [],
        progression: 0
      };
    }
  }
}

module.exports = {
  dissertationService: new DissertationService()
};
