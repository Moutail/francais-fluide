// src/routes/admin-support.js
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

// GET /api/admin/support - Liste des tickets de support
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      category,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const [tickets, totalTickets] = await Promise.all([
      prisma.supportTicket.findMany({
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
              subscription: {
                select: { plan: true, status: true }
              }
            }
          }
        }
      }),
      prisma.supportTicket.count({ where: whereClause })
    ]);

    // Statistiques rapides
    const stats = await Promise.all([
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { status: 'resolved' } }),
      prisma.supportTicket.count({ where: { priority: 'high' } })
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        stats: {
          open: stats[0],
          inProgress: stats[1],
          resolved: stats[2],
          highPriority: stats[3]
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTickets,
          pages: Math.ceil(totalTickets / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/admin/support/:id - Détails d'un ticket
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            subscription: {
              select: { plan: true, status: true }
            },
            progress: {
              select: {
                level: true,
                xp: true,
                exercisesCompleted: true,
                lastActivity: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket non trouvé'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/admin/support/:id - Répondre/Modifier un ticket
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('response').optional().isLength({ min: 10, max: 2000 }).withMessage('Réponse invalide')
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
      const { status, priority, response } = req.body;

      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(priority && { priority }),
          ...(response && { response })
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
        data: ticket,
        message: 'Ticket mis à jour avec succès'
      });

    } catch (error) {
      console.error('Erreur modification ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// DELETE /api/admin/support/:id - Supprimer un ticket
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.supportTicket.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Ticket supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/admin/support/stats/overview - Statistiques détaillées
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      averageResponseTime,
      ticketsByCategory,
      ticketsByPriority,
      recentTickets
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      prisma.supportTicket.count({ 
        where: { 
          status: 'resolved',
          updatedAt: { gte: daysAgo }
        }
      }),
      // Calcul approximatif du temps de réponse moyen
      prisma.supportTicket.aggregate({
        where: {
          status: 'resolved',
          updatedAt: { gte: daysAgo }
        },
        _avg: {
          id: true // Placeholder - à améliorer avec un vrai calcul de temps
        }
      }),
      prisma.supportTicket.groupBy({
        by: ['category'],
        _count: true,
        where: { createdAt: { gte: daysAgo } }
      }),
      prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: true,
        where: { status: { in: ['open', 'in_progress'] } }
      }),
      prisma.supportTicket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    // Calcul du taux de résolution
    const resolutionRate = totalTickets > 0 ? 
      ((await prisma.supportTicket.count({ where: { status: 'resolved' } })) / totalTickets * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalTickets,
          openTickets,
          resolvedTickets,
          resolutionRate: parseFloat(resolutionRate),
          averageResponseTime: '2.5 heures' // Placeholder
        },
        distribution: {
          byCategory: ticketsByCategory,
          byPriority: ticketsByPriority
        },
        recent: recentTickets
      }
    });

  } catch (error) {
    console.error('Erreur statistiques support:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/support/bulk-action - Actions en lot
router.post('/bulk-action',
  authenticateToken,
  requireAdmin,
  [
    body('action').isIn(['close', 'resolve', 'priority', 'delete']).withMessage('Action invalide'),
    body('ticketIds').isArray({ min: 1 }).withMessage('IDs de tickets requis'),
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

      const { action, ticketIds, value } = req.body;

      let updateData = {};
      let deleteAction = false;

      switch (action) {
        case 'close':
          updateData = { status: 'closed' };
          break;
        case 'resolve':
          updateData = { status: 'resolved' };
          break;
        case 'priority':
          if (!value || !['low', 'medium', 'high'].includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Priorité invalide'
            });
          }
          updateData = { priority: value };
          break;
        case 'delete':
          deleteAction = true;
          break;
      }

      let result;
      
      if (deleteAction) {
        result = await prisma.supportTicket.deleteMany({
          where: { id: { in: ticketIds } }
        });
      } else {
        result = await prisma.supportTicket.updateMany({
          where: { id: { in: ticketIds } },
          data: updateData
        });
      }

      res.json({
        success: true,
        data: {
          affected: result.count
        },
        message: `${result.count} ticket(s) traité(s) avec succès`
      });

    } catch (error) {
      console.error('Erreur action en lot:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

module.exports = router;
