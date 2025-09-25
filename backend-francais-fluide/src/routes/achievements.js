// src/routes/achievements.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateAchievement = [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères'),
  body('type').isIn(['words_written', 'exercises_completed', 'streak', 'level', 'accuracy']).withMessage('Type de succès invalide'),
  body('threshold').isInt({ min: 1 }).withMessage('Seuil invalide'),
  body('icon').optional().isString().withMessage('Icône invalide')
];

// GET /api/achievements - Récupérer tous les succès disponibles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer tous les succès avec le statut de l'utilisateur
    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
          select: {
            earnedAt: true
          }
        }
      },
      orderBy: [
        { type: 'asc' },
        { threshold: 'asc' }
      ]
    });

    // Formater les données pour inclure le statut
    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement,
      earned: achievement.userAchievements.length > 0,
      earnedAt: achievement.userAchievements[0]?.earnedAt || null,
      userAchievements: undefined // Supprimer cette propriété du résultat
    }));

    // Grouper par type pour l'affichage
    const achievementsByType = achievementsWithStatus.reduce((acc, achievement) => {
      if (!acc[achievement.type]) {
        acc[achievement.type] = [];
      }
      acc[achievement.type].push(achievement);
      return acc;
    }, {});

    // Calculer les statistiques
    const stats = {
      total: achievements.length,
      earned: achievementsWithStatus.filter(a => a.earned).length,
      remaining: achievementsWithStatus.filter(a => !a.earned).length,
      progress: Math.round((achievementsWithStatus.filter(a => a.earned).length / achievements.length) * 100)
    };

    res.json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        achievementsByType,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération succès:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/achievements/user - Récupérer les succès de l'utilisateur
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    // Récupérer les succès récents (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAchievements = userAchievements.filter(
      ua => new Date(ua.earnedAt) >= sevenDaysAgo
    );

    res.json({
      success: true,
      data: {
        achievements: userAchievements.map(ua => ({
          ...ua.achievement,
          earnedAt: ua.earnedAt
        })),
        recent: recentAchievements.map(ua => ({
          ...ua.achievement,
          earnedAt: ua.earnedAt
        })),
        stats: {
          total: userAchievements.length,
          recent: recentAchievements.length
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération succès utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/achievements/check - Vérifier les nouveaux succès débloqués
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer la progression de l'utilisateur
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        error: 'Progression utilisateur non trouvée'
      });
    }

    // Récupérer tous les succès
    const achievements = await prisma.achievement.findMany();

    // Récupérer les succès déjà débloqués
    const earnedAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    });

    const earnedIds = new Set(earnedAchievements.map(ea => ea.achievementId));
    const newlyEarned = [];

    // Vérifier chaque succès
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) {
        continue; // Déjà débloqué
      }

      let qualified = false;

      switch (achievement.type) {
        case 'words_written':
          qualified = userProgress.wordsWritten >= achievement.threshold;
          break;
        case 'exercises_completed':
          qualified = userProgress.exercisesCompleted >= achievement.threshold;
          break;
        case 'streak':
          qualified = userProgress.currentStreak >= achievement.threshold;
          break;
        case 'level':
          qualified = userProgress.level >= achievement.threshold;
          break;
        case 'accuracy':
          qualified = userProgress.accuracy >= achievement.threshold;
          break;
      }

      if (qualified) {
        // Débloquer le succès
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        });

        newlyEarned.push(achievement);
      }
    }

    // Ajouter des XP bonus pour les nouveaux succès
    if (newlyEarned.length > 0) {
      const bonusXP = newlyEarned.length * 50; // 50 XP par succès
      await prisma.userProgress.update({
        where: { userId },
        data: {
          xp: { increment: bonusXP }
        }
      });
    }

    res.json({
      success: true,
      data: {
        newAchievements: newlyEarned,
        bonusXP: newlyEarned.length * 50,
        message: newlyEarned.length > 0 ? 
          `Félicitations ! Vous avez débloqué ${newlyEarned.length} nouveau(x) succès !` :
          'Aucun nouveau succès débloqué pour le moment.'
      }
    });

  } catch (error) {
    console.error('Erreur vérification succès:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/achievements - Créer un nouveau succès (admin)
router.post('/', authenticateToken, validateAchievement, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { name, description, type, threshold, icon } = req.body;

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        type,
        threshold,
        icon
      }
    });

    res.status(201).json({
      success: true,
      data: achievement
    });

  } catch (error) {
    console.error('Erreur création succès:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/achievements/leaderboard - Classement des utilisateurs
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const { type = 'total', limit = 10 } = req.query;

    let orderBy;
    switch (type) {
      case 'xp':
        orderBy = { xp: 'desc' };
        break;
      case 'level':
        orderBy = { level: 'desc' };
        break;
      case 'streak':
        orderBy = { currentStreak: 'desc' };
        break;
      case 'accuracy':
        orderBy = { accuracy: 'desc' };
        break;
      default: // total achievements
        orderBy = { xp: 'desc' }; // Par défaut, trier par XP
    }

    const users = await prisma.user.findMany({
      include: {
        progress: true,
        _count: {
          select: {
            achievements: true
          }
        }
      },
      take: parseInt(limit)
    });

    // Trier selon le type demandé
    let sortedUsers;
    if (type === 'total') {
      sortedUsers = users.sort((a, b) => b._count.achievements - a._count.achievements);
    } else {
      sortedUsers = users.sort((a, b) => {
        const aValue = a.progress?.[type] || 0;
        const bValue = b.progress?.[type] || 0;
        return bValue - aValue;
      });
    }

    const leaderboard = sortedUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      achievements: user._count.achievements,
      level: user.progress?.level || 1,
      xp: user.progress?.xp || 0,
      currentStreak: user.progress?.currentStreak || 0,
      accuracy: Math.round(user.progress?.accuracy || 0)
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        type,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Erreur récupération classement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/achievements/progress/:type - Progression vers un type de succès
router.get('/progress/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.userId;

    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        error: 'Progression utilisateur non trouvée'
      });
    }

    // Récupérer les succès de ce type
    const achievements = await prisma.achievement.findMany({
      where: { type },
      include: {
        userAchievements: {
          where: { userId },
          select: { earnedAt: true }
        }
      },
      orderBy: { threshold: 'asc' }
    });

    const currentValue = userProgress[type] || 0;

    // Trouver le prochain succès à débloquer
    const nextAchievement = achievements.find(a => 
      a.userAchievements.length === 0 && a.threshold > currentValue
    );

    const progress = achievements.map(achievement => ({
      ...achievement,
      earned: achievement.userAchievements.length > 0,
      earnedAt: achievement.userAchievements[0]?.earnedAt || null,
      progress: Math.min(100, Math.round((currentValue / achievement.threshold) * 100)),
      userAchievements: undefined
    }));

    res.json({
      success: true,
      data: {
        type,
        currentValue,
        achievements: progress,
        nextAchievement,
        totalEarned: progress.filter(a => a.earned).length,
        totalAvailable: progress.length
      }
    });

  } catch (error) {
    console.error('Erreur récupération progression succès:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
