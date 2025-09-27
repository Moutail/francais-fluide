// src/routes/dictations.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkQuota, checkDictationQuota } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateDictation = [
  body('title').trim().isLength({ min: 2 }).withMessage('Le titre doit contenir au moins 2 caractères'),
  body('text').trim().isLength({ min: 10 }).withMessage('Le texte doit contenir au moins 10 caractères'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Difficulté invalide'),
  body('duration').isInt({ min: 1, max: 60 }).withMessage('Durée invalide (1-60 minutes)')
];

const validateDictationAttempt = [
  body('userText').trim().isLength({ min: 1 }).withMessage('Texte utilisateur requis'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Temps invalide')
];

// GET /api/dictations - Récupérer toutes les dictées
router.get('/', authenticateToken, checkDictationQuota, async (req, res) => {
  try {
    const { difficulty, limit = 10, page = 1 } = req.query;
    
    const whereClause = {};
    if (difficulty) whereClause.difficulty = difficulty;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const dictations = await prisma.dictation.findMany({
      where: whereClause,
      take: parseInt(limit),
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        category: true,
        tags: true,
        completed: false, // Ne pas exposer le texte complet
        score: false,
        attempts: true,
        createdAt: true
      }
    });

    const total = await prisma.dictation.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        dictations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération dictées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/dictations/:id - Récupérer une dictée spécifique
router.get('/:id', authenticateToken, checkDictationQuota, async (req, res) => {
  try {
    const { id } = req.params;

    const dictation = await prisma.dictation.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        audioUrl: true,
        category: true,
        tags: true,
        createdAt: true
        // Note: Ne pas exposer le texte complet avant la soumission
      }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    res.json({
      success: true,
      data: dictation
    });

  } catch (error) {
    console.error('Erreur récupération dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/dictations/:id/attempt - Soumettre une tentative de dictée
router.post('/:id/attempt', authenticateToken, checkDictationQuota, validateDictationAttempt, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { userText, timeSpent = 0 } = req.body;
    const userId = req.user.userId;

    // Récupérer la dictée avec le texte complet
    const dictation = await prisma.dictation.findUnique({
      where: { id }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    // Calculer le score (simple comparaison de mots)
    const originalWords = dictation.text.toLowerCase().split(/\s+/);
    const userWords = userText.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    const maxLength = Math.max(originalWords.length, userWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (originalWords[i] && userWords[i] && originalWords[i] === userWords[i]) {
        correctWords++;
      }
    }

    const score = Math.round((correctWords / originalWords.length) * 100);

    // Mettre à jour les statistiques de la dictée
    await prisma.dictation.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        completed: score >= 70, // Considéré comme complété si score >= 70%
        score: score > (dictation.score || 0) ? score : dictation.score // Garder le meilleur score
      }
    });

    // Enregistrer l'usage
    await prisma.usageLog.create({
      data: {
        userId,
        type: 'dictation',
        details: JSON.stringify({
          dictationId: id,
          score,
          timeSpent,
          wordCount: userWords.length,
          correctWords
        })
      }
    });

    // Mettre à jour la progression utilisateur
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (userProgress) {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          wordsWritten: { increment: userWords.length },
          timeSpent: { increment: Math.round(timeSpent / 60) }, // Convertir en minutes
          accuracy: (userProgress.accuracy + score) / 2, // Moyenne mobile
          lastActivity: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: {
        score,
        correctWords,
        totalWords: originalWords.length,
        accuracy: Math.round((correctWords / originalWords.length) * 100),
        timeSpent,
        originalText: dictation.text, // Révéler le texte original après soumission
        feedback: {
          excellent: score >= 90,
          good: score >= 70,
          needsImprovement: score < 70,
          message: score >= 90 ? 'Excellent travail !' : 
                   score >= 70 ? 'Bon travail, continuez !' : 
                   'Continuez à vous entraîner, vous progresserez !'
        }
      }
    });

  } catch (error) {
    console.error('Erreur soumission dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/dictations - Créer une nouvelle dictée (admin)
router.post('/', authenticateToken, validateDictation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { title, description, difficulty, duration, text, audioUrl, category, tags } = req.body;

    const dictation = await prisma.dictation.create({
      data: {
        title,
        description,
        difficulty,
        duration,
        text,
        audioUrl,
        category,
        tags: tags ? JSON.stringify(tags) : null
      }
    });

    res.status(201).json({
      success: true,
      data: dictation
    });

  } catch (error) {
    console.error('Erreur création dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/dictations/user/progress - Progression utilisateur en dictées
router.get('/user/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId,
        type: 'dictation'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const attempts = usageLogs.map(log => {
      const details = JSON.parse(log.details || '{}');
      return {
        date: log.createdAt,
        dictationId: details.dictationId,
        score: details.score,
        timeSpent: details.timeSpent,
        wordCount: details.wordCount,
        correctWords: details.correctWords
      };
    });

    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 ? 
        Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
      totalTimeSpent: attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
      totalWordsWritten: attempts.reduce((sum, a) => sum + (a.wordCount || 0), 0),
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
      recentAttempts: attempts.slice(0, 10)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération progression dictées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
