// src/routes/admin-dictations.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware admin
const requireAdmin = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { role: true, isActive: true }
  });

  if (!user || !user.isActive || !['admin', 'super_admin'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Droits administrateur requis'
    });
  }

  req.user.role = user.role;
  next();
};

// GET /api/admin/dictations - Liste des dictées
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      difficulty,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [dictations, totalDictations] = await Promise.all([
      prisma.dictation.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.dictation.count({ where: whereClause })
    ]);

    // Statistiques des dictées
    const stats = await Promise.all([
      prisma.dictation.count(),
      prisma.dictation.count({ where: { completed: true } }),
      prisma.dictation.groupBy({
        by: ['difficulty'],
        _count: true
      }),
      prisma.dictation.aggregate({
        _avg: { attempts: true, score: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        dictations,
        stats: {
          total: stats[0],
          completed: stats[1],
          byDifficulty: stats[2],
          averageAttempts: Math.round(stats[3]._avg.attempts || 0),
          averageScore: Math.round(stats[3]._avg.score || 0)
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalDictations,
          pages: Math.ceil(totalDictations / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération dictées admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/dictations - Créer une dictée
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Titre invalide'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Difficulté invalide'),
    body('duration').isInt({ min: 10, max: 600 }).withMessage('Durée invalide (10-600 secondes)'),
    body('text').trim().isLength({ min: 50, max: 5000 }).withMessage('Texte invalide'),
    body('audioUrl').optional().isURL().withMessage('URL audio invalide'),
    body('category').optional().trim().isLength({ max: 50 }),
    body('tags').optional().isArray()
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

      const { 
        title, 
        description, 
        difficulty, 
        duration, 
        text, 
        audioUrl, 
        category,
        tags 
      } = req.body;

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
        data: dictation,
        message: 'Dictée créée avec succès'
      });

    } catch (error) {
      console.error('Erreur création dictée:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// GET /api/admin/dictations/:id - Détails d'une dictée
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const dictation = await prisma.dictation.findUnique({
      where: { id }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    // Statistiques d'utilisation
    const usageStats = await prisma.usageLog.findMany({
      where: {
        type: 'dictation',
        details: {
          contains: `"dictationId":"${id}"`
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    const attempts = usageStats.map(log => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          score: details.score || 0,
          timeSpent: details.timeSpent || 0,
          wordCount: details.wordCount || 0,
          date: log.createdAt
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    const avgScore = attempts.length > 0 ? 
      Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0;

    res.json({
      success: true,
      data: {
        dictation,
        stats: {
          totalAttempts: attempts.length,
          averageScore: avgScore,
          recentAttempts: attempts.slice(0, 10)
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/admin/dictations/:id - Modifier une dictée
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('duration').optional().isInt({ min: 10, max: 600 }),
    body('text').optional().trim().isLength({ min: 50, max: 5000 }),
    body('audioUrl').optional().isURL(),
    body('category').optional().trim().isLength({ max: 50 }),
    body('tags').optional().isArray()
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

      const { id } = req.params;
      const { 
        title, 
        description, 
        difficulty, 
        duration, 
        text, 
        audioUrl, 
        category,
        tags 
      } = req.body;

      const dictation = await prisma.dictation.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(difficulty && { difficulty }),
          ...(duration && { duration }),
          ...(text && { text }),
          ...(audioUrl !== undefined && { audioUrl }),
          ...(category !== undefined && { category }),
          ...(tags && { tags: JSON.stringify(tags) })
        }
      });

      res.json({
        success: true,
        data: dictation,
        message: 'Dictée modifiée avec succès'
      });

    } catch (error) {
      console.error('Erreur modification dictée:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// DELETE /api/admin/dictations/:id - Supprimer une dictée
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la dictée existe
    const dictation = await prisma.dictation.findUnique({
      where: { id }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    await prisma.dictation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Dictée supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/dictations/bulk-action - Actions en lot
router.post('/bulk-action',
  authenticateToken,
  requireAdmin,
  [
    body('action').isIn(['delete', 'difficulty', 'category']).withMessage('Action invalide'),
    body('dictationIds').isArray({ min: 1 }).withMessage('IDs de dictées requis'),
    body('value').optional().isString()
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

      const { action, dictationIds, value } = req.body;

      let result;

      switch (action) {
        case 'delete':
          result = await prisma.dictation.deleteMany({
            where: { id: { in: dictationIds } }
          });
          break;
        
        case 'difficulty':
          if (!value || !['beginner', 'intermediate', 'advanced'].includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Difficulté invalide'
            });
          }
          result = await prisma.dictation.updateMany({
            where: { id: { in: dictationIds } },
            data: { difficulty: value }
          });
          break;
        
        case 'category':
          result = await prisma.dictation.updateMany({
            where: { id: { in: dictationIds } },
            data: { category: value }
          });
          break;
      }

      res.json({
        success: true,
        data: {
          affected: result.count
        },
        message: `${result.count} dictée(s) traitée(s) avec succès`
      });

    } catch (error) {
      console.error('Erreur action en lot dictées:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// GET /api/admin/dictations/stats/performance - Statistiques de performance
router.get('/stats/performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Récupérer les tentatives récentes
    const recentAttempts = await prisma.usageLog.findMany({
      where: {
        type: 'dictation',
        createdAt: { gte: daysAgo }
      }
    });

    const attemptData = recentAttempts.map(log => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          dictationId: details.dictationId,
          score: details.score || 0,
          timeSpent: details.timeSpent || 0,
          date: log.createdAt
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Calculer les statistiques
    const totalAttempts = attemptData.length;
    const averageScore = totalAttempts > 0 ? 
      Math.round(attemptData.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;
    
    const averageTime = totalAttempts > 0 ? 
      Math.round(attemptData.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts) : 0;

    // Dictées les plus populaires
    const popularDictations = {};
    attemptData.forEach(attempt => {
      if (!popularDictations[attempt.dictationId]) {
        popularDictations[attempt.dictationId] = 0;
      }
      popularDictations[attempt.dictationId]++;
    });

    const topDictations = Object.entries(popularDictations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          averageScore,
          averageTime,
          period: parseInt(period)
        },
        popular: topDictations.map(([id, count]) => ({
          dictationId: id,
          attempts: count
        })),
        trends: {
          daily: [] // À implémenter si nécessaire
        }
      }
    });

  } catch (error) {
    console.error('Erreur statistiques performance dictées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
