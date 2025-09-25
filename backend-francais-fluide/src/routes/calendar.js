// src/routes/calendar.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateEvent = [
  body('title').trim().isLength({ min: 2 }).withMessage('Le titre doit contenir au moins 2 caractères'),
  body('type').isIn(['exercise', 'study', 'achievement', 'reminder']).withMessage('Type d\'événement invalide'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format d\'heure invalide (HH:MM)'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points invalides')
];

// GET /api/calendar - Récupérer les événements du calendrier
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, year, type, completed } = req.query;

    let whereClause = { userId };

    // Filtrer par mois/année si spécifié
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Filtrer par type si spécifié
    if (type) {
      whereClause.type = type;
    }

    // Filtrer par statut de completion si spécifié
    if (completed !== undefined) {
      whereClause.completed = completed === 'true';
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    // Grouper par date pour faciliter l'affichage
    const eventsByDate = events.reduce((acc, event) => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});

    // Calculer les statistiques
    const stats = {
      total: events.length,
      completed: events.filter(e => e.completed).length,
      pending: events.filter(e => !e.completed && new Date(e.date) >= new Date()).length,
      overdue: events.filter(e => !e.completed && new Date(e.date) < new Date()).length,
      totalPoints: events.filter(e => e.completed).reduce((sum, e) => sum + e.points, 0)
    };

    res.json({
      success: true,
      data: {
        events,
        eventsByDate,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération événements calendrier:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/calendar/:id - Récupérer un événement spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Erreur récupération événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/calendar - Créer un nouvel événement
router.post('/', authenticateToken, validateEvent, async (req, res) => {
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
    const { title, type, date, time, description, points = 0 } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        type,
        date: new Date(date),
        time,
        description,
        points
      }
    });

    res.status(201).json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/calendar/:id - Mettre à jour un événement
router.put('/:id', authenticateToken, validateEvent, async (req, res) => {
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
    const userId = req.user.userId;
    const { title, type, date, time, description, points, completed } = req.body;

    // Vérifier que l'événement appartient à l'utilisateur
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id, userId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        type,
        date: new Date(date),
        time,
        description,
        points: points !== undefined ? points : existingEvent.points,
        completed: completed !== undefined ? completed : existingEvent.completed
      }
    });

    res.json({
      success: true,
      data: updatedEvent
    });

  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PATCH /api/calendar/:id/complete - Marquer un événement comme complété
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Vérifier que l'événement appartient à l'utilisateur
    const event = await prisma.calendarEvent.findFirst({
      where: { id, userId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        completed: true
      }
    });

    // Ajouter les points à la progression de l'utilisateur si applicable
    if (event.points > 0) {
      const userProgress = await prisma.userProgress.findUnique({
        where: { userId }
      });

      if (userProgress) {
        await prisma.userProgress.update({
          where: { userId },
          data: {
            xp: { increment: event.points },
            lastActivity: new Date()
          }
        });
      }
    }

    res.json({
      success: true,
      data: updatedEvent,
      message: event.points > 0 ? `Événement complété ! +${event.points} XP` : 'Événement complété !'
    });

  } catch (error) {
    console.error('Erreur completion événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/calendar/:id - Supprimer un événement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Vérifier que l'événement appartient à l'utilisateur
    const event = await prisma.calendarEvent.findFirst({
      where: { id, userId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/calendar/suggestions/generate - Générer des suggestions d'événements
router.get('/suggestions/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer le profil utilisateur pour personnaliser les suggestions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const suggestions = [];
    const today = new Date();

    // Suggestions basées sur le niveau
    const level = user.progress?.level || 1;
    
    if (level <= 2) {
      suggestions.push({
        title: 'Révision des bases de grammaire',
        type: 'study',
        description: 'Réviser les règles de grammaire fondamentales',
        points: 10,
        suggestedDate: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Demain
      });
    }

    if (level >= 2) {
      suggestions.push({
        title: 'Exercice de conjugaison',
        type: 'exercise',
        description: 'Pratiquer la conjugaison des verbes irréguliers',
        points: 15,
        suggestedDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) // Après-demain
      });
    }

    // Suggestions basées sur la dernière activité
    const lastActivity = user.progress?.lastActivity;
    if (!lastActivity || (today - new Date(lastActivity)) > 7 * 24 * 60 * 60 * 1000) {
      suggestions.push({
        title: 'Retour à l\'entraînement',
        type: 'reminder',
        description: 'Il est temps de reprendre vos exercices de français !',
        points: 5,
        suggestedDate: today
      });
    }

    // Suggestions hebdomadaires
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 1) { // Lundi
      suggestions.push({
        title: 'Objectif de la semaine',
        type: 'study',
        description: 'Définir vos objectifs d\'apprentissage pour cette semaine',
        points: 20,
        suggestedDate: today
      });
    }

    res.json({
      success: true,
      data: {
        suggestions,
        userLevel: level,
        lastActivity: lastActivity
      }
    });

  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
