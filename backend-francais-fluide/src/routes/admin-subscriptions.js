// src/routes/admin-subscriptions.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware admin (réutilisé)
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

// GET /api/admin/subscriptions - Gestion des abonnements
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      plan, 
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (plan) whereClause.plan = plan;
    if (status) whereClause.status = status;
    
    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [subscriptions, totalSubscriptions] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      }),
      prisma.subscription.count({ where: whereClause })
    ]);

    // Statistiques des abonnements
    const stats = await prisma.subscription.groupBy({
      by: ['plan', 'status'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        subscriptions,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSubscriptions,
          pages: Math.ceil(totalSubscriptions / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/subscriptions - Créer un abonnement
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('userId').isString().withMessage('ID utilisateur requis'),
    body('plan').isIn(['demo', 'etudiant', 'premium', 'etablissement']).withMessage('Plan invalide'),
    body('status').optional().isIn(['active', 'pending', 'cancelled', 'expired']),
    body('duration').optional().isInt({ min: 1, max: 24 }).withMessage('Durée invalide (1-24 mois)')
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

      const { userId, plan, status = 'active', duration = 12 } = req.body;

      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      // Calculer les dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);

      let subscription;

      if (user.subscription) {
        // Mettre à jour l'abonnement existant
        subscription = await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            plan,
            status,
            startDate,
            endDate
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
      } else {
        // Créer un nouvel abonnement
        subscription = await prisma.subscription.create({
          data: {
            userId,
            plan,
            status,
            startDate,
            endDate
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Abonnement créé/mis à jour avec succès'
      });

    } catch (error) {
      console.error('Erreur création abonnement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// PUT /api/admin/subscriptions/:id - Modifier un abonnement
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('plan').optional().isIn(['demo', 'etudiant', 'premium', 'etablissement']),
    body('status').optional().isIn(['active', 'pending', 'cancelled', 'expired']),
    body('endDate').optional().isISO8601()
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
      const { plan, status, endDate } = req.body;

      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          ...(plan && { plan }),
          ...(status && { status }),
          ...(endDate && { endDate: new Date(endDate) })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: subscription,
        message: 'Abonnement modifié avec succès'
      });

    } catch (error) {
      console.error('Erreur modification abonnement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// DELETE /api/admin/subscriptions/:id - Supprimer un abonnement
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subscription.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Abonnement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/admin/subscriptions/stats - Statistiques détaillées
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      recentSubscriptions,
      subscriptionsByPlan,
      subscriptionsByStatus,
      revenueByPlan
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'expired' } }),
      prisma.subscription.count({
        where: { createdAt: { gte: daysAgo } }
      }),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: true,
        where: { status: 'active' }
      }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: true,
        where: { 
          status: 'active',
          createdAt: { gte: daysAgo }
        }
      })
    ]);

    // Calcul du taux de conversion (approximatif)
    const totalUsers = await prisma.user.count();
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
          recentSubscriptions,
          conversionRate: parseFloat(conversionRate)
        },
        distribution: {
          byPlan: subscriptionsByPlan,
          byStatus: subscriptionsByStatus
        },
        revenue: {
          byPlan: revenueByPlan
        }
      }
    });

  } catch (error) {
    console.error('Erreur statistiques abonnements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
