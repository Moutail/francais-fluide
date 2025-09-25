// src/routes/admin.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware pour vérifier les droits admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise'
    });
  }

  // Récupérer les informations utilisateur avec le rôle
  prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { role: true, isActive: true }
  }).then(user => {
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé ou inactif'
      });
    }

    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Droits administrateur requis'
      });
    }

    req.user.role = user.role;
    next();
  }).catch(error => {
    console.error('Erreur vérification admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de vérification des droits'
    });
  });
};

// Middleware pour super admin uniquement
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Droits super administrateur requis'
    });
  }
  next();
};

// GET /api/admin/dashboard - Tableau de bord admin
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Statistiques générales
    const [
      totalUsers,
      activeUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalExercises,
      totalDictations,
      supportTickets,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.exercise.count(),
      prisma.dictation.count(),
      prisma.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: { plan: true, status: true }
          }
        }
      })
    ]);

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, newSubscriptions] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.subscription.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalSubscriptions,
          activeSubscriptions,
          totalExercises,
          totalDictations,
          openSupportTickets: supportTickets
        },
        trends: {
          newUsersLast30Days: newUsers,
          newSubscriptionsLast30Days: newSubscriptions
        },
        recentUsers
      }
    });

  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/admin/users - Gestion des utilisateurs
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construire les conditions de recherche
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    // Récupérer les utilisateurs avec pagination
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          subscription: true,
          progress: {
            select: {
              level: true,
              xp: true,
              exercisesCompleted: true,
              lastActivity: true
            }
          },
          _count: {
            select: {
              supportTickets: true,
              exercises: true
            }
          }
        }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          password: undefined // Ne jamais exposer les mots de passe
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/users - Créer un utilisateur
router.post('/users', 
  authenticateToken, 
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Mot de passe trop court'),
    body('role').isIn(['user', 'admin', 'super_admin', 'tester', 'teacher']).withMessage('Rôle invalide'),
    body('subscriptionPlan').optional().isIn(['demo', 'etudiant', 'premium', 'etablissement'])
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

      const { name, email, password, role, subscriptionPlan, notes } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Vérifier les droits pour créer certains rôles
      if (['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Seuls les super administrateurs peuvent créer des administrateurs'
        });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur avec transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role
          }
        });

        // Créer la progression
        await tx.userProgress.create({
          data: {
            userId: user.id,
            wordsWritten: 0,
            accuracy: 0,
            timeSpent: 0,
            exercisesCompleted: 0,
            currentStreak: 0,
            level: 1,
            xp: 0
          }
        });

        // Créer l'abonnement si spécifié
        if (subscriptionPlan) {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + (subscriptionPlan === 'demo' ? 1 : 12));

          await tx.subscription.create({
            data: {
              userId: user.id,
              plan: subscriptionPlan,
              status: 'active',
              startDate: new Date(),
              endDate
            }
          });
        }

        return user;
      });

      res.status(201).json({
        success: true,
        data: {
          ...result,
          password: undefined
        },
        message: 'Utilisateur créé avec succès'
      });

    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// PUT /api/admin/users/:id - Modifier un utilisateur
router.put('/users/:id',
  authenticateToken,
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['user', 'admin', 'super_admin', 'tester', 'teacher']),
    body('isActive').optional().isBoolean()
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
      const { name, email, role, isActive } = req.body;

      // Vérifier que l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      // Vérifier les droits pour modifier certains rôles
      if (role && ['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Droits insuffisants pour ce rôle'
        });
      }

      // Empêcher de se désactiver soi-même
      if (id === req.user.userId && isActive === false) {
        return res.status(400).json({
          success: false,
          error: 'Vous ne pouvez pas vous désactiver vous-même'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive })
        },
        include: {
          subscription: true,
          progress: true
        }
      });

      res.json({
        success: true,
        data: {
          ...updatedUser,
          password: undefined
        },
        message: 'Utilisateur modifié avec succès'
      });

    } catch (error) {
      console.error('Erreur modification utilisateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher de se supprimer soi-même
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas vous supprimer vous-même'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Seuls les super admins peuvent supprimer des admins
    if (['admin', 'super_admin'].includes(user.role) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Droits insuffisants pour supprimer cet utilisateur'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
