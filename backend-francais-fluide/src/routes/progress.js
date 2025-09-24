// src/routes/progress.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateProgressUpdate = [
  body('wordsWritten').optional().isInt({ min: 0 }).withMessage('wordsWritten doit être un nombre positif'),
  body('accuracy').optional().isFloat({ min: 0, max: 100 }).withMessage('accuracy doit être entre 0 et 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('timeSpent doit être un nombre positif'),
  body('exercisesCompleted').optional().isInt({ min: 0 }).withMessage('exercisesCompleted doit être un nombre positif'),
  body('currentStreak').optional().isInt({ min: 0 }).withMessage('currentStreak doit être un nombre positif'),
  body('level').optional().isInt({ min: 1 }).withMessage('level doit être au moins 1'),
  body('xp').optional().isInt({ min: 0 }).withMessage('xp doit être un nombre positif')
];

// GET /api/progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      // Créer une progression par défaut si elle n'existe pas
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
      
      return res.json({
        success: true,
        data: defaultProgress
      });
    }

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Erreur récupération progression:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/progress
router.put('/', authenticateToken, validateProgressUpdate, async (req, res) => {
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
    const updateData = req.body;

    // Récupérer la progression actuelle
    const currentProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!currentProgress) {
      return res.status(404).json({
        success: false,
        error: 'Progression non trouvée'
      });
    }

    // Calculer les nouvelles valeurs
    const newData = {
      wordsWritten: updateData.wordsWritten !== undefined 
        ? currentProgress.wordsWritten + updateData.wordsWritten 
        : currentProgress.wordsWritten,
      accuracy: updateData.accuracy !== undefined 
        ? updateData.accuracy 
        : currentProgress.accuracy,
      timeSpent: updateData.timeSpent !== undefined 
        ? currentProgress.timeSpent + updateData.timeSpent 
        : currentProgress.timeSpent,
      exercisesCompleted: updateData.exercisesCompleted !== undefined 
        ? currentProgress.exercisesCompleted + updateData.exercisesCompleted 
        : currentProgress.exercisesCompleted,
      currentStreak: updateData.currentStreak !== undefined 
        ? updateData.currentStreak 
        : currentProgress.currentStreak,
      level: updateData.level !== undefined 
        ? updateData.level 
        : currentProgress.level,
      xp: updateData.xp !== undefined 
        ? currentProgress.xp + updateData.xp 
        : currentProgress.xp,
      lastActivity: new Date()
    };

    // Mettre à jour la progression
    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: newData
    });

    // Vérifier les achievements
    await checkAchievements(userId, updatedProgress);

    res.json({
      success: true,
      data: updatedProgress
    });

  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/progress/achievement
router.post('/achievement', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { achievementId } = req.body;

    // Vérifier si l'achievement existe
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà cet achievement
    const existingUserAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      }
    });

    if (existingUserAchievement) {
      return res.status(400).json({
        success: false,
        error: 'Achievement déjà obtenu'
      });
    }

    // Ajouter l'achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        earnedAt: new Date()
      },
      include: {
        achievement: true
      }
    });

    res.json({
      success: true,
      data: userAchievement
    });

  } catch (error) {
    console.error('Erreur ajout achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Fonction pour vérifier les achievements
async function checkAchievements(userId, progress) {
  const achievements = await prisma.achievement.findMany();
  
  for (const achievement of achievements) {
    let shouldAward = false;
    
    switch (achievement.type) {
      case 'words_written':
        shouldAward = progress.wordsWritten >= achievement.threshold;
        break;
      case 'exercises_completed':
        shouldAward = progress.exercisesCompleted >= achievement.threshold;
        break;
      case 'streak':
        shouldAward = progress.currentStreak >= achievement.threshold;
        break;
      case 'level':
        shouldAward = progress.level >= achievement.threshold;
        break;
      case 'accuracy':
        shouldAward = progress.accuracy >= achievement.threshold;
        break;
    }
    
    if (shouldAward) {
      // Vérifier si l'utilisateur n'a pas déjà cet achievement
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      });
      
      if (!existing) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            earnedAt: new Date()
          }
        });
      }
    }
  }
}

module.exports = router;
