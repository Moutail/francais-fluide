// src/routes/progress-simple.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/progress - Version simplifiée
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 GET /api/progress - Début');
    const userId = req.user.userId;
    console.log('👤 User ID:', userId);
    
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    console.log('📊 Progression trouvée:', !!progress);

    if (!progress) {
      console.log('⚠️ Progression non trouvée, création par défaut...');
      const defaultProgress = await prisma.userProgress.create({
        data: {
          userId,
          wordsWritten: 0,
          accuracy: 0,
          timeSpent: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0,
          lastActivity: new Date(),
        }
      });
      
      console.log('✅ Progression par défaut créée');
      return res.json({
        success: true,
        data: defaultProgress
      });
    }

    console.log('✅ Progression retournée');
    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('❌ Erreur récupération progression:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

// PUT /api/progress - Version simplifiée
router.put('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 PUT /api/progress - Début');
    const userId = req.user.userId;
    const body = req.body;
    
    console.log('📝 Données reçues:', body);

    const updatedProgress = await prisma.userProgress.upsert({
      where: { userId },
      update: {
        wordsWritten: body.wordsWritten || 0,
        accuracy: body.accuracy || 0,
        timeSpent: body.timeSpent || 0,
        exercisesCompleted: body.exercisesCompleted || 0,
        currentStreak: body.currentStreak || 0,
        level: body.level || 1,
        xp: body.xp || 0,
        lastActivity: new Date(),
      },
      create: {
        userId,
        wordsWritten: body.wordsWritten || 0,
        accuracy: body.accuracy || 0,
        timeSpent: body.timeSpent || 0,
        exercisesCompleted: body.exercisesCompleted || 0,
        currentStreak: body.currentStreak || 0,
        level: body.level || 1,
        xp: body.xp || 0,
        lastActivity: new Date(),
      }
    });

    console.log('✅ Progression mise à jour');
    res.json({
      success: true,
      data: updatedProgress
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour progression:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

module.exports = router;
