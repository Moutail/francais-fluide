const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth');

// POST /api/telemetry - Enregistrer les événements de télémétrie
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { events } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les événements sont requis'
      });
    }

    // Valider et formater les événements
    const validEvents = events.filter(event => {
      return event.type && event.timestamp && event.data;
    }).map(event => ({
      userId,
      type: event.type,
      timestamp: new Date(event.timestamp),
      data: JSON.stringify(event.data || {}),
      exerciseId: event.exerciseId || null,
      questionId: event.questionId || null
    }));

    if (validEvents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun événement valide trouvé'
      });
    }

    // Enregistrer les événements en batch
    const createdEvents = await prisma.telemetryEvent.createMany({
      data: validEvents,
      skipDuplicates: true
    });

    res.json({
      success: true,
      message: `${createdEvents.count} événements enregistrés`,
      data: { count: createdEvents.count }
    });

  } catch (error) {
    console.error('Erreur enregistrement télémétrie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'enregistrement des événements'
    });
  }
});

// GET /api/telemetry/analytics - Obtenir les analytics pour l'IA
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exerciseId, days = 30 } = req.query;

    const whereClause = {
      userId,
      timestamp: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (exerciseId) {
      whereClause.exerciseId = exerciseId;
    }

    // Récupérer les statistiques d'erreurs
    const errorStats = await prisma.telemetryEvent.groupBy({
      by: ['type', 'data'],
      where: {
        ...whereClause,
        type: {
          in: ['answer_selected', 'answer_changed', 'question_skipped']
        }
      },
      _count: true
    });

    // Récupérer les temps de réponse moyens
    const responseTimeEvents = await prisma.telemetryEvent.findMany({
      where: {
        ...whereClause,
        type: 'question_completed'
      },
      select: { data: true, exerciseId: true, questionId: true }
    });

    // Analyser les patterns d'erreurs
    const errorPatterns = {};
    errorStats.forEach(stat => {
      const key = `${stat.type}_${JSON.stringify(stat.data)}`;
      if (!errorPatterns[key]) {
        errorPatterns[key] = { count: 0, data: stat.data };
      }
      errorPatterns[key].count += stat._count;
    });

    // Calculer les temps de réponse moyens
    const avgResponseTimes = responseTimeEvents.reduce((acc, event) => {
      let parsed;
      try { parsed = JSON.parse(event.data || '{}'); } catch { parsed = {}; }
      const responseTime = parsed?.responseTime;
      if (typeof responseTime === 'number') {
        if (!acc[event.exerciseId]) {
          acc[event.exerciseId] = { total: 0, count: 0 };
        }
        acc[event.exerciseId].total += responseTime;
        acc[event.exerciseId].count += 1;
      }
      return acc;
    }, {});

    // Calculer les moyennes
    Object.keys(avgResponseTimes).forEach(exerciseId => {
      const stats = avgResponseTimes[exerciseId];
      stats.average = stats.total / stats.count;
    });

    res.json({
      success: true,
      data: {
        errorPatterns,
        averageResponseTimes: avgResponseTimes,
        totalEvents: errorStats.reduce((sum, stat) => sum + stat._count, 0),
        period: `${days} jours`
      }
    });

  } catch (error) {
    console.error('Erreur analytics télémétrie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des analytics'
    });
  }
});

module.exports = router;
