// src/routes/dissertation.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requirePremiumAccess, checkUsageQuota } = require('../middleware/premiumAccess');
const { dissertationService } = require('../services/dissertationService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateDissertationRequest = [
  body('type').isIn(['argumentative', 'comparative', 'explicative', 'poetique', 'creative']).withMessage('Type de dissertation invalide'),
  body('subject').trim().isLength({ min: 10, max: 500 }).withMessage('Sujet invalide'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Niveau invalide')
];

const validateDissertationAnalysis = [
  body('text').trim().isLength({ min: 100, max: 50000 }).withMessage('Texte de dissertation invalide'),
  body('type').isIn(['argumentative', 'comparative', 'explicative', 'poetique', 'creative']).withMessage('Type invalide'),
  body('subject').trim().isLength({ min: 10, max: 500 }).withMessage('Sujet invalide'),
  body('options').optional().isObject().withMessage('Options invalides')
];

// GET /api/dissertation/types - Récupérer les types de dissertations disponibles
router.get('/types', authenticateToken, requirePremiumAccess, async (req, res) => {
  try {
    const types = dissertationService.getDissertationTypes();
    
    res.json({
      success: true,
      data: {
        types,
        total: types.length,
        access_level: req.user.plan
      }
    });

  } catch (error) {
    console.error('Erreur récupération types dissertation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/dissertation/plan - Générer un plan de dissertation
router.post('/plan', 
  authenticateToken, 
  requirePremiumAccess,
  checkUsageQuota('dissertation_plan'),
  validateDissertationRequest,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: errors.array()
        });
      }

      const { type, subject, level = 'intermediate' } = req.body;
      const userId = req.user.userId;

      // Générer le plan
      const plan = await dissertationService.generatePlan(type, subject, level);

      // Enregistrer l'usage
      await prisma.usageLog.create({
        data: {
          userId,
          type: 'dissertation_plan',
          details: JSON.stringify({
            dissertation_type: type,
            subject,
            level,
            generated_by: plan.generated_by,
            tokens_used: plan.tokens_used || 0
          })
        }
      });

      res.json({
        success: true,
        data: {
          plan,
          quota: req.user.quota,
          message: 'Plan généré avec succès'
        }
      });

    } catch (error) {
      console.error('Erreur génération plan dissertation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du plan'
      });
    }
  }
);

// POST /api/dissertation/analyze - Analyser et corriger une dissertation
router.post('/analyze',
  authenticateToken,
  requirePremiumAccess,
  checkUsageQuota('dissertation_analysis'),
  validateDissertationAnalysis,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: errors.array()
        });
      }

      const { text, type, subject, options = {} } = req.body;
      const userId = req.user.userId;

      // Analyser la dissertation
      const analysis = await dissertationService.analyzeDissertation(text, type, subject, {
        ...options,
        level: options.level || 'intermediate'
      });

      // Suivre la progression
      await dissertationService.trackDissertationProgress(userId, type, subject, analysis);

      res.json({
        success: true,
        data: {
          analysis,
          quota: req.user.quota,
          message: 'Analyse complète terminée'
        }
      });

    } catch (error) {
      console.error('Erreur analyse dissertation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'analyse de la dissertation'
      });
    }
  }
);

// GET /api/dissertation/exercises - Générer des exercices d'entraînement
router.get('/exercises', 
  authenticateToken, 
  requirePremiumAccess,
  async (req, res) => {
    try {
      const { type, level = 'intermediate', count = 5 } = req.query;

      if (!type) {
        return res.status(400).json({
          success: false,
          error: 'Type de dissertation requis'
        });
      }

      const exercises = await dissertationService.generateTrainingExercises(
        type, 
        level, 
        parseInt(count)
      );

      res.json({
        success: true,
        data: exercises
      });

    } catch (error) {
      console.error('Erreur génération exercices dissertation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des exercices'
      });
    }
  }
);

// GET /api/dissertation/progress - Statistiques de progression
router.get('/progress', authenticateToken, requirePremiumAccess, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 30 } = req.query;

    const stats = await dissertationService.getDissertationStats(userId, parseInt(period));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération progression dissertation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// POST /api/dissertation/feedback - Obtenir des conseils personnalisés
router.post('/feedback',
  authenticateToken,
  requirePremiumAccess,
  [
    body('weaknesses').optional().isArray().withMessage('Faiblesses invalides'),
    body('goals').optional().isArray().withMessage('Objectifs invalides'),
    body('previous_scores').optional().isArray().withMessage('Scores précédents invalides')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: errors.array()
        });
      }

      const userId = req.user.userId;
      const { weaknesses = [], goals = [], previous_scores = [] } = req.body;

      // Récupérer les statistiques de l'utilisateur
      const userStats = await dissertationService.getDissertationStats(userId);
      
      // Générer des conseils personnalisés
      const prompt = `Basé sur les données suivantes, donnez des conseils personnalisés pour améliorer les dissertations:

STATISTIQUES UTILISATEUR:
- Analyses totales: ${userStats.total_analyses}
- Score moyen: ${userStats.average_score}%
- Progression: ${userStats.progression > 0 ? '+' : ''}${userStats.progression} points

FAIBLESSES IDENTIFIÉES: ${weaknesses.join(', ') || 'Aucune spécifiée'}
OBJECTIFS: ${goals.join(', ') || 'Amélioration générale'}
SCORES RÉCENTS: ${previous_scores.join(', ') || 'Aucun'}

Donnez 5 conseils pratiques et encourageants en JSON:
{
  "conseils": [
    {
      "titre": "Titre du conseil",
      "description": "Description détaillée",
      "exercice_pratique": "Exercice concret à faire"
    }
  ]
}`;

      // Générer des conseils de base (l'IA sera intégrée dans le service)
      const feedback = {
        conseils: [
          {
            titre: "Structurez vos idées",
            description: "Organisez votre dissertation selon la structure classique introduction-développement-conclusion",
            exercice_pratique: "Rédigez d'abord un plan détaillé avant de commencer la rédaction"
          },
          {
            titre: "Développez vos arguments",
            description: "Chaque argument doit être étayé par des exemples précis et des références",
            exercice_pratique: "Pour chaque idée, trouvez au moins deux exemples concrets"
          },
          {
            titre: "Soignez les transitions",
            description: "Les liens entre vos parties doivent être fluides et logiques",
            exercice_pratique: "Rédigez une phrase de transition pour chaque changement de partie"
          },
          {
            titre: "Enrichissez votre vocabulaire",
            description: "Utilisez un vocabulaire varié et précis adapté au niveau académique",
            exercice_pratique: "Remplacez les mots trop simples par des synonymes plus soutenus"
          },
          {
            titre: "Relisez attentivement",
            description: "Une relecture minutieuse permet de corriger les erreurs et d'améliorer le style",
            exercice_pratique: "Relisez votre texte à voix haute pour détecter les maladresses"
          }
        ]
      };

      res.json({
        success: true,
        data: feedback
      });

    } catch (error) {
      console.error('Erreur génération feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des conseils'
      });
    }
  }
);

// GET /api/dissertation/templates - Modèles de dissertations
router.get('/templates', authenticateToken, requirePremiumAccess, async (req, res) => {
  try {
    const { type } = req.query;

    const templates = {
      argumentative: {
        introduction: "Phrase d'accroche\nContextualisation du sujet\nProblématique\nAnnonce du plan",
        developpement: "I. Thèse\n   A. Premier argument\n   B. Deuxième argument\n\nII. Antithèse\n   A. Premier contre-argument\n   B. Deuxième contre-argument\n\nIII. Synthèse\n   A. Dépassement du conflit\n   B. Position nuancée",
        conclusion: "Synthèse des arguments\nRéponse à la problématique\nOuverture"
      },
      comparative: {
        introduction: "Présentation des éléments à comparer\nProblématique comparative\nAnnonce du plan",
        developpement: "I. Similitudes\n   A. Point commun 1\n   B. Point commun 2\n\nII. Différences\n   A. Différence majeure 1\n   B. Différence majeure 2\n\nIII. Analyse critique\n   A. Portée des similitudes\n   B. Signification des différences",
        conclusion: "Bilan de la comparaison\nJugement critique\nPerspectives"
      }
    };

    const template = type ? templates[type] : templates;

    res.json({
      success: true,
      data: {
        templates: template,
        available_types: Object.keys(templates)
      }
    });

  } catch (error) {
    console.error('Erreur récupération templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
