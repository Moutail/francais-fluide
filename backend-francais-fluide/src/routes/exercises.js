// src/routes/exercises.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkQuota } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateExerciseSubmission = [
  body('exerciseId').isString().withMessage('exerciseId est requis'),
  body('answers').isArray().withMessage('answers doit être un tableau'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('timeSpent doit être un nombre positif')
];

// GET /api/exercises
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { level, type, limit = 10 } = req.query;
    const userId = req.user.userId;

    const whereClause = {
      OR: [
        { userId: userId }, // Exercices de l'utilisateur
        { userId: null }    // Exercices par défaut (sans userId)
      ]
    };
    
    if (level) whereClause.level = parseInt(level);
    if (type) whereClause.type = type;

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    res.json({
      success: true,
      data: exercises
    });

  } catch (error) {
    console.error('Erreur récupération exercices:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/exercises/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercice non trouvé'
      });
    }

    res.json({
      success: true,
      data: exercise
    });

  } catch (error) {
    console.error('Erreur récupération exercice:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/exercises/:id/submit
router.post('/:id/submit', authenticateToken, checkQuota, validateExerciseSubmission, async (req, res) => {
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
    const { answers, timeSpent = 0 } = req.body;
    const userId = req.user.userId;

    // Récupérer l'exercice
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercice non trouvé'
      });
    }

    // Calculer le score
    let correctAnswers = 0;
    const results = [];

    for (let i = 0; i < exercise.questions.length; i++) {
      const question = exercise.questions[i];
      const userAnswer = answers[i];
      const isCorrect = question.correctAnswer === userAnswer;
      
      if (isCorrect) correctAnswers++;
      
      results.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    }

    const score = Math.round((correctAnswers / exercise.questions.length) * 100);

    // Sauvegarder la soumission
    const submission = await prisma.exerciseSubmission.create({
      data: {
        userId,
        exerciseId: id,
        answers: JSON.stringify(answers),
        score,
        timeSpent,
        completedAt: new Date()
      }
    });

    // Mettre à jour la progression de l'utilisateur
    await prisma.userProgress.update({
      where: { userId },
      data: {
        exercisesCompleted: { increment: 1 },
        xp: { increment: score },
        timeSpent: { increment: timeSpent }
      }
    });

    // Enregistrer l'usage
    await prisma.usageLog.create({
      data: {
        userId,
        type: 'exercise',
        details: {
          exerciseId: id,
          score,
          timeSpent
        }
      }
    });

    res.json({
      success: true,
      data: {
        submission,
        results,
        score,
        correctAnswers,
        totalQuestions: exercise.questions.length
      }
    });

  } catch (error) {
    console.error('Erreur soumission exercice:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/exercises/user/progress
router.get('/user/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const submissions = await prisma.exerciseSubmission.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 50
    });

    // Calculer les statistiques
    const totalExercises = submissions.length;
    const averageScore = totalExercises > 0 
      ? submissions.reduce((sum, sub) => sum + sub.score, 0) / totalExercises 
      : 0;
    
    const exercisesByType = submissions.reduce((acc, sub) => {
      const type = sub.exercise.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const exercisesByLevel = submissions.reduce((acc, sub) => {
      const level = sub.exercise.level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        submissions,
        statistics: {
          totalExercises,
          averageScore: Math.round(averageScore),
          exercisesByType,
          exercisesByLevel
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération progression exercices:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
