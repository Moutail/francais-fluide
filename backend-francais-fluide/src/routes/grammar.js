// src/routes/grammar.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkQuota } = require('../middleware/auth');
const { grammarService } = require('../services/grammarService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateTextAnalysis = [
  body('text').isString().isLength({ min: 3, max: 10000 }).withMessage('Le texte doit contenir entre 3 et 10000 caractères'),
  body('action').optional().isIn(['analyze', 'correct']).withMessage('Action doit être "analyze" ou "correct"'),
  body('useLanguageTool').optional().isBoolean().withMessage('useLanguageTool doit être un booléen'),
  body('maxErrors').optional().isInt({ min: 1, max: 100 }).withMessage('maxErrors doit être entre 1 et 100')
];

// POST /api/grammar/analyze
router.post('/analyze', authenticateToken, checkQuota, validateTextAnalysis, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { 
      text, 
      action = 'analyze', 
      corrections, 
      useLanguageTool = true,
      maxErrors = 50 
    } = req.body;

    const userId = req.user.userId;
    const clientIP = req.ip || req.connection.remoteAddress;

    let result;

    if (action === 'analyze') {
      // Analyser le texte
      result = await grammarService.analyzeText(text, {
        useLanguageTool,
        maxErrors,
        clientIP,
        userId
      });
      
    } else if (action === 'correct' && corrections) {
      // Appliquer les corrections
      const correctedText = grammarService.correctText(text, corrections);
      result = await grammarService.analyzeText(correctedText, {
        useLanguageTool,
        maxErrors,
        clientIP,
        userId
      });
      
    } else {
      return res.status(400).json({
        success: false,
        error: 'Action non valide. Utilisez "analyze" ou "correct"'
      });
    }

    // Enregistrer l'usage
    await prisma.usageLog.create({
      data: {
        userId,
        type: 'correction',
        details: {
          textLength: text.length,
          errorCount: result.errors.length,
          useLanguageTool
        }
      }
    });

    // Calculer des métriques supplémentaires
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const errorDensity = wordCount > 0 ? result.errors.length / wordCount : 0;
    const accuracy = Math.max(0, 100 - (errorDensity * 100));

    const response = {
      success: true,
      data: {
        analysis: result,
        metrics: {
          wordCount,
          errorCount: result.errors.length,
          errorDensity: Math.round(errorDensity * 1000) / 1000,
          accuracy: Math.round(accuracy),
          cacheSize: grammarService.getCacheSize(),
          rateLimitRemaining: grammarService.getRateLimitRemaining(clientIP)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erreur lors de l\'analyse grammaticale:', error);
    
    // Gestion spécifique des erreurs de rate limiting
    if (error.message && error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Veuillez patienter.',
        message: 'Limite de requêtes atteinte. Réessayez dans une minute.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de l\'analyse grammaticale'
    });
  }
});

// GET /api/grammar/info
router.get('/info', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        version: '2.0.0',
        supportedLanguages: ['fr'],
        maxTextLength: 10000,
        features: {
          localDetection: true,
          languageToolIntegration: true,
          caching: true,
          rateLimiting: true,
          advancedGrammarRules: true
        },
        cache: {
          size: grammarService.getCacheSize()
        },
        grammarRules: {
          total: 25,
          categories: ['grammar', 'spelling', 'punctuation', 'style'],
          advanced: [
            'Concordance des temps',
            'Subjonctif',
            'Participes passés complexes',
            'Barbarismes courants',
            'Anglicismes',
            'Pléonasmes',
            'Conjonctions et connecteurs'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération info grammar:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/grammar/cache
router.delete('/cache', authenticateToken, async (req, res) => {
  try {
    grammarService.clearCache();
    
    res.json({
      success: true,
      message: 'Cache vidé avec succès'
    });
  } catch (error) {
    console.error('Erreur vidage cache:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
