const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth');

// POST /api/ai/generate-exercises - Générer des exercices personnalisés basés sur les données de télémétrie
router.post('/generate-exercises', authenticateToken, async (req, res) => {
  try {
    const { count = 3, focusAreas = [], difficulty = 'medium', userProfile } = req.body;
    const userId = req.user.userId;

    // Récupérer les données de télémétrie de l'utilisateur
    const telemetryData = await prisma.telemetryEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Analyser les patterns d'erreur
    const errorAnalysis = analyzeErrorPatterns(telemetryData);
    
    // Générer des exercices ciblés
    const exercises = generateTargetedExercises({
      count,
      focusAreas,
      difficulty,
      errorAnalysis,
      userProfile
    });

    // Sauvegarder les exercices générés dans la base de données
    const savedExercises = [];
    for (const exercise of exercises) {
      try {
        const savedExercise = await prisma.exercise.create({
          data: {
            title: exercise.title,
            description: exercise.description,
            type: exercise.type,
            difficulty: exercise.difficulty,
            level: userProfile?.level || 2,
            questions: {
              create: exercise.questions.map((q, index) => ({
                question: q.question,
                options: JSON.stringify(q.options),
                correctAnswer: q.correctAnswer.toString(),
                explanation: q.explanation,
                order: index
              }))
            }
          },
          include: {
            questions: true
          }
        });
        savedExercises.push(savedExercise);
      } catch (error) {
        console.error('Erreur sauvegarde exercice:', error);
        // Continuer même si un exercice échoue
      }
    }

    res.json({
      success: true,
      data: {
        exercises: savedExercises,
        analysis: errorAnalysis,
        recommendations: generateRecommendations(errorAnalysis)
      }
    });

  } catch (error) {
    console.error('Erreur génération exercices IA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des exercices personnalisés',
      error: error?.message || String(error)
    });
  }
});

// POST /api/ai/analyze-progress - Analyser la progression de l'utilisateur
router.post('/analyze-progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 30 } = req.body; // jours

    // Récupérer les données de progression
    const progressData = await prisma.userProgress.findUnique({
      where: { userId }
    });

    // Récupérer les soumissions d'exercices
    const submissions = await prisma.exerciseSubmission.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        exercise: true
      },
      orderBy: { completedAt: 'desc' }
    });

    // Récupérer les données de télémétrie
    const telemetryData = await prisma.telemetryEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Analyser la progression
    const analysis = {
      overallProgress: analyzeOverallProgress(progressData, submissions),
      errorPatterns: analyzeErrorPatterns(telemetryData),
      learningVelocity: calculateLearningVelocity(submissions),
      strengths: identifyStrengths(submissions),
      weaknesses: identifyWeaknesses(telemetryData, submissions),
      recommendations: generateProgressRecommendations(progressData, submissions, telemetryData)
    };

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Erreur analyse progression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse de la progression'
    });
  }
});

// POST /api/ai/adaptive-difficulty - Ajuster la difficulté automatiquement
router.post('/adaptive-difficulty', authenticateToken, async (req, res) => {
  try {
    const { exerciseType, currentDifficulty } = req.body;
    const userId = req.user.id;

    // Analyser les performances récentes pour ce type d'exercice
    const recentPerformance = await analyzeRecentPerformance(userId, exerciseType);
    
    // Calculer la difficulté optimale
    const optimalDifficulty = calculateOptimalDifficulty(recentPerformance, currentDifficulty);

    res.json({
      success: true,
      data: {
        currentDifficulty,
        recommendedDifficulty: optimalDifficulty,
        reasoning: generateDifficultyReasoning(recentPerformance),
        confidence: calculateConfidence(recentPerformance)
      }
    });

  } catch (error) {
    console.error('Erreur ajustement difficulté:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajustement de la difficulté'
    });
  }
});

// Fonctions d'analyse
function analyzeErrorPatterns(telemetryData) {
  const patterns = {};
  
  telemetryData.forEach(event => {
    if (event.type === 'question_completed') {
      const data = JSON.parse(event.data);
      const key = `${event.exerciseId}_${data.isCorrect ? 'correct' : 'incorrect'}`;
      
      if (!patterns[key]) {
        patterns[key] = {
          exerciseId: event.exerciseId,
          type: data.isCorrect ? 'correct' : 'incorrect',
          count: 0,
          averageTime: 0,
          totalTime: 0
        };
      }
      
      patterns[key].count++;
      patterns[key].totalTime += data.responseTime || 0;
      patterns[key].averageTime = patterns[key].totalTime / patterns[key].count;
    }
  });

  return Object.values(patterns);
}

function generateTargetedExercises({ count, focusAreas, difficulty, errorAnalysis, userProfile }) {
  // Logique de génération d'exercices basée sur les erreurs
  const exercises = [];
  
  // Exemples d'exercices ciblés (à remplacer par une vraie génération IA)
  const exerciseTemplates = {
    grammar: {
      easy: [
        {
          title: 'Accord sujet-verbe - Niveau facile',
          description: 'Choisissez la bonne forme du verbe',
          type: 'grammar',
          difficulty: 'easy',
          questions: [
            {
              question: 'Les enfants _____ (jouer) dans le jardin.',
              options: ['joue', 'jouent', 'jouons', 'joues'],
              correctAnswer: 1,
              explanation: 'Avec "les enfants" (pluriel), on utilise "jouent".'
            }
          ]
        }
      ],
      medium: [
        {
          title: 'Accord sujet-verbe - Niveau moyen',
          description: 'Choisissez la bonne forme du verbe',
          type: 'grammar',
          difficulty: 'medium',
          questions: [
            {
              question: 'L\'un des garçons _____ (être) très grand.',
              options: ['est', 'sont', 'êtes', 'es'],
              correctAnswer: 0,
              explanation: 'Avec "l\'un des", on accorde avec "l\'un" (singulier).'
            }
          ]
        }
      ],
      hard: [
        {
          title: 'Accord sujet-verbe - Niveau difficile',
          description: 'Choisissez la bonne forme du verbe',
          type: 'grammar',
          difficulty: 'hard',
          questions: [
            {
              question: 'La plupart des étudiants _____ (réussir) leurs examens.',
              options: ['réussit', 'réussissent', 'réussis', 'réussissons'],
              correctAnswer: 1,
              explanation: 'Avec "la plupart des", on accorde avec le complément (pluriel).'
            }
          ]
        }
      ]
    },
    vocabulary: {
      easy: [
        {
          title: 'Vocabulaire de base - Niveau facile',
          description: 'Choisissez le bon mot',
          type: 'vocabulary',
          difficulty: 'easy',
          questions: [
            {
              question: 'Je vais _____ (manger) une pomme.',
              options: ['manger', 'boire', 'voir', 'entendre'],
              correctAnswer: 0,
              explanation: 'On mange une pomme, on ne la boit pas.'
            }
          ]
        }
      ],
      medium: [
        {
          title: 'Vocabulaire avancé - Niveau moyen',
          description: 'Choisissez le mot le plus approprié',
          type: 'vocabulary',
          difficulty: 'medium',
          questions: [
            {
              question: 'Cette situation est très _____ (difficile).',
              options: ['difficile', 'complexe', 'simple', 'facile'],
              correctAnswer: 1,
              explanation: 'Complexe est plus précis que difficile pour une situation.'
            }
          ]
        }
      ],
      hard: [
        {
          title: 'Vocabulaire spécialisé - Niveau difficile',
          description: 'Choisissez le terme le plus précis',
          type: 'vocabulary',
          difficulty: 'hard',
          questions: [
            {
              question: 'Le médecin a posé un _____ (diagnostic).',
              options: ['diagnostic', 'pronostic', 'prognostic', 'diagnose'],
              correctAnswer: 0,
              explanation: 'Diagnostic est le terme médical correct en français.'
            }
          ]
        }
      ]
    },
    conjugation: {
      easy: [
        {
          title: 'Conjugaison présent - Niveau facile',
          description: 'Conjuguez le verbe au présent',
          type: 'conjugation',
          difficulty: 'easy',
          questions: [
            {
              question: 'Je _____ (être) content.',
              options: ['suis', 'es', 'est', 'sommes'],
              correctAnswer: 0,
              explanation: 'Je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont.'
            }
          ]
        }
      ],
      medium: [
        {
          title: 'Conjugaison passé composé - Niveau moyen',
          description: 'Conjuguez le verbe au passé composé',
          type: 'conjugation',
          difficulty: 'medium',
          questions: [
            {
              question: 'Hier, nous _____ (aller) au cinéma.',
              options: ['sommes allés', 'avons allés', 'sommes allé', 'avons allé'],
              correctAnswer: 0,
              explanation: 'Aller se conjugue avec être au passé composé, et on accorde avec le sujet.'
            }
          ]
        }
      ],
      hard: [
        {
          title: 'Conjugaison subjonctif - Niveau difficile',
          description: 'Conjuguez le verbe au subjonctif présent',
          type: 'conjugation',
          difficulty: 'hard',
          questions: [
            {
              question: 'Il faut que je _____ (faire) mes devoirs.',
              options: ['fasse', 'fais', 'ferai', 'ferais'],
              correctAnswer: 0,
              explanation: 'Le subjonctif présent de faire est: que je fasse, que tu fasses, qu\'il fasse, etc.'
            }
          ]
        }
      ]
    },
    spelling: {
      easy: [
        {
          title: 'Orthographe de base - Niveau facile',
          description: 'Choisissez la bonne orthographe',
          type: 'spelling',
          difficulty: 'easy',
          questions: [
            {
              question: 'Je vais _____ (à) la maison.',
              options: ['à', 'a', 'as', 'ah'],
              correctAnswer: 0,
              explanation: 'À est une préposition de lieu, a est le verbe avoir.'
            }
          ]
        }
      ],
      medium: [
        {
          title: 'Orthographe homophones - Niveau moyen',
          description: 'Distinguer les homophones',
          type: 'spelling',
          difficulty: 'medium',
          questions: [
            {
              question: 'Il a _____ (son) chapeau sur la tête.',
              options: ['son', 'sont', 'sons', 'sonts'],
              correctAnswer: 0,
              explanation: 'Son est un déterminant possessif, sont est le verbe être.'
            }
          ]
        }
      ],
      hard: [
        {
          title: 'Orthographe complexe - Niveau difficile',
          description: 'Choisissez la bonne orthographe',
          type: 'spelling',
          difficulty: 'hard',
          questions: [
            {
              question: 'Cette situation est _____ (particulière).',
              options: ['particulière', 'particuliere', 'particulières', 'particulières'],
              correctAnswer: 0,
              explanation: 'Particulière prend deux l et un accent grave sur le e final.'
            }
          ]
        }
      ]
    }
  };

  // Générer des exercices basés sur les zones de focus
  if (focusAreas && focusAreas.length > 0) {
    focusAreas.forEach(area => {
      if (exerciseTemplates[area] && exerciseTemplates[area][difficulty]) {
        exercises.push(...exerciseTemplates[area][difficulty].slice(0, Math.ceil(count / focusAreas.length)));
      }
    });
  } else {
    // Si pas de focus areas, générer des exercices de grammaire par défaut
    if (exerciseTemplates.grammar && exerciseTemplates.grammar[difficulty]) {
      exercises.push(...exerciseTemplates.grammar[difficulty].slice(0, count));
    }
  }

  // Si pas assez d'exercices, compléter avec des exercices de base
  if (exercises.length < count) {
    const remaining = count - exercises.length;
    if (exerciseTemplates.grammar && exerciseTemplates.grammar.easy) {
      exercises.push(...exerciseTemplates.grammar.easy.slice(0, remaining));
    }
  }

  return exercises.slice(0, count);
}

function generateRecommendations(errorAnalysis) {
  const recommendations = [];
  
  if (errorAnalysis && errorAnalysis.length > 0) {
    const errorCount = errorAnalysis.reduce((sum, pattern) => sum + pattern.count, 0);
    
    if (errorCount > 5) {
      recommendations.push({
        type: 'focus',
        message: 'Concentrez-vous sur les exercices de grammaire pour améliorer vos résultats.',
        priority: 'high'
      });
    }
    
    if (errorCount > 10) {
      recommendations.push({
        type: 'practice',
        message: 'Pratiquez régulièrement pour réduire le nombre d\'erreurs.',
        priority: 'medium'
      });
    }
  } else {
    recommendations.push({
      type: 'encouragement',
      message: 'Excellent travail ! Continuez à pratiquer pour maintenir votre niveau.',
      priority: 'low'
    });
  }
  
  return recommendations;
}

function analyzeOverallProgress(progressData, submissions) {
  if (!progressData) return null;

  const recentSubmissions = submissions.slice(0, 10);
  const averageScore = recentSubmissions.reduce((acc, sub) => acc + sub.score, 0) / recentSubmissions.length;

  return {
    currentLevel: progressData.level,
    xp: progressData.xp,
    averageScore: Math.round(averageScore),
    exercisesCompleted: progressData.exercisesCompleted,
    accuracy: progressData.accuracy,
    timeSpent: progressData.timeSpent,
    currentStreak: progressData.currentStreak
  };
}

function calculateLearningVelocity(submissions) {
  if (submissions.length < 2) return 0;

  const scores = submissions.map(s => s.score);
  const timeDiff = (submissions[0].completedAt - submissions[submissions.length - 1].completedAt) / (1000 * 60 * 60 * 24); // jours
  
  const scoreImprovement = scores[0] - scores[scores.length - 1];
  return timeDiff > 0 ? scoreImprovement / timeDiff : 0;
}

function identifyStrengths(submissions) {
  const exerciseTypes = {};
  
  submissions.forEach(sub => {
    if (sub.score >= 80) { // Score élevé
      const type = sub.exercise.type;
      if (!exerciseTypes[type]) {
        exerciseTypes[type] = { count: 0, totalScore: 0 };
      }
      exerciseTypes[type].count++;
      exerciseTypes[type].totalScore += sub.score;
    }
  });

  return Object.entries(exerciseTypes)
    .map(([type, data]) => ({
      type,
      averageScore: Math.round(data.totalScore / data.count),
      count: data.count
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

function identifyWeaknesses(telemetryData, submissions) {
  const errorTypes = {};
  
  telemetryData.forEach(event => {
    if (event.type === 'question_completed') {
      const data = JSON.parse(event.data);
      if (!data.isCorrect) {
        const exerciseType = event.exerciseId; // À améliorer avec le vrai type
        if (!errorTypes[exerciseType]) {
          errorTypes[exerciseType] = 0;
        }
        errorTypes[exerciseType]++;
      }
    }
  });

  return Object.entries(errorTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function generateProgressRecommendations(progressData, submissions, telemetryData) {
  const recommendations = [];

  if (progressData && progressData.accuracy < 70) {
    recommendations.push({
      type: 'accuracy',
      message: 'Votre précision est faible. Concentrez-vous sur les exercices de base.',
      priority: 'high'
    });
  }

  if (progressData && progressData.currentStreak < 3) {
    recommendations.push({
      type: 'consistency',
      message: 'Pratiquez plus régulièrement pour améliorer votre progression.',
      priority: 'medium'
    });
  }

  return recommendations;
}

async function analyzeRecentPerformance(userId, exerciseType) {
  const recentSubmissions = await prisma.exerciseSubmission.findMany({
    where: {
      userId,
      exercise: { type: exerciseType },
      completedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
      }
    },
    orderBy: { completedAt: 'desc' },
    take: 10
  });

  if (recentSubmissions.length === 0) return null;

  const averageScore = recentSubmissions.reduce((acc, sub) => acc + sub.score, 0) / recentSubmissions.length;
  const averageTime = recentSubmissions.reduce((acc, sub) => acc + sub.timeSpent, 0) / recentSubmissions.length;

  return {
    averageScore,
    averageTime,
    count: recentSubmissions.length,
    trend: calculateTrend(recentSubmissions.map(s => s.score))
  };
}

function calculateTrend(scores) {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(0, Math.ceil(scores.length / 2));
  const older = scores.slice(Math.ceil(scores.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function calculateOptimalDifficulty(performance, currentDifficulty) {
  if (!performance) return currentDifficulty;

  const { averageScore, trend } = performance;
  
  if (averageScore >= 90 && trend === 'improving') {
    return increaseDifficulty(currentDifficulty);
  } else if (averageScore < 60 || trend === 'declining') {
    return decreaseDifficulty(currentDifficulty);
  }
  
  return currentDifficulty;
}

function increaseDifficulty(current) {
  const levels = ['easy', 'medium', 'hard'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

function decreaseDifficulty(current) {
  const levels = ['easy', 'medium', 'hard'];
  const currentIndex = levels.indexOf(current);
  return levels[Math.max(currentIndex - 1, 0)];
}

function generateDifficultyReasoning(performance) {
  if (!performance) return 'Données insuffisantes pour ajuster la difficulté';
  
  const { averageScore, trend, count } = performance;
  
  if (averageScore >= 90 && trend === 'improving') {
    return `Excellent score (${Math.round(averageScore)}%) et tendance positive. Augmentation de la difficulté recommandée.`;
  } else if (averageScore < 60 || trend === 'declining') {
    return `Score faible (${Math.round(averageScore)}%) ou tendance négative. Réduction de la difficulté recommandée.`;
  }
  
  return `Performance stable (${Math.round(averageScore)}%). Difficulté maintenue.`;
}

function calculateConfidence(performance) {
  if (!performance || performance.count < 3) return 0.3;
  if (performance.count >= 10) return 0.9;
  return Math.min(0.3 + (performance.count * 0.1), 0.9);
}

module.exports = router;
