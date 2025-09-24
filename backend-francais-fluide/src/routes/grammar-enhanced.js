// src/routes/grammar-enhanced.js - API de correction grammaticale avec IA
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkQuota } = require('../middleware/auth');
const { aiService } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateGrammarRequest = [
  body('text').isString().isLength({ min: 1, max: 5000 }).withMessage('Le texte doit contenir entre 1 et 5000 caractères'),
  body('context').optional().isString().withMessage('Le contexte doit être une chaîne de caractères')
];

// POST /api/grammar/correct - Correction grammaticale avec IA
router.post('/correct', authenticateToken, checkQuota, validateGrammarRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { text, context } = req.body;
    const userId = req.user.userId;

    // Récupérer le profil utilisateur pour personnaliser la correction
    const userProfile = await getUserProfile(userId);
    const errorPatterns = await getUserErrorPatterns(userId);

    // Construire le prompt de correction personnalisé
    const correctionPrompt = buildCorrectionPrompt(text, userProfile, errorPatterns, context);

    // Utiliser l'IA pour la correction
    const aiResponse = await aiService.generateResponse(correctionPrompt, {
      context: 'correction_grammaticale',
      userId
    });

    // Parser la réponse IA pour extraire les corrections
    const corrections = parseCorrections(aiResponse.content);

    // Enregistrer l'usage
    await prisma.usageLog.create({
      data: {
        userId,
        type: 'correction',
        details: {
          textLength: text.length,
          correctionsCount: corrections.length,
          context: context || ''
        }
      }
    });

    // Télémétrie: correction effectuée
    await prisma.telemetryEvent.create({
      data: {
        userId,
        type: 'grammar_check',
        timestamp: new Date(),
        data: JSON.stringify({
          textLength: text.length,
          correctionsCount: corrections.length,
          context: context || ''
        })
      }
    });

    res.json({
      success: true,
      data: {
        originalText: text,
        correctedText: corrections.correctedText || text,
        corrections: corrections.errors || [],
        suggestions: corrections.suggestions || [],
        complexity: analyzeTextComplexity(text),
        personalizedTips: corrections.tips || []
      }
    });

  } catch (error) {
    console.error('Erreur correction grammaticale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/grammar/analyze - Analyse de texte avec IA
router.post('/analyze', authenticateToken, checkQuota, validateGrammarRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { text, context } = req.body;
    const userId = req.user.userId;

    const userProfile = await getUserProfile(userId);
    const analysisPrompt = buildAnalysisPrompt(text, userProfile, context);

    const aiResponse = await aiService.generateResponse(analysisPrompt, {
      context: 'analyse_texte',
      userId
    });

    const analysis = parseAnalysis(aiResponse.content);

    res.json({
      success: true,
      data: {
        text,
        analysis,
        complexity: analyzeTextComplexity(text),
        recommendations: analysis.recommendations || []
      }
    });

  } catch (error) {
    console.error('Erreur analyse texte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Fonctions utilitaires
async function getUserProfile(userId) {
  if (!userId) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        progress: true,
        subscription: true 
      }
    });
    
    return user ? {
      level: user.progress?.level || 1,
      accuracy: user.progress?.accuracy || 0,
      exercisesCompleted: user.progress?.exercisesCompleted || 0,
      plan: user.subscription?.plan || 'demo'
    } : null;
  } catch (error) {
    console.error('Erreur récupération profil utilisateur:', error);
    return null;
  }
}

async function getUserErrorPatterns(userId) {
  if (!userId) return [];
  
  try {
    const errorEvents = await prisma.telemetryEvent.findMany({
      where: {
        userId,
        type: 'question_completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 50
    });

    const errorTypes = {};
    errorEvents.forEach(event => {
      try {
        const data = JSON.parse(event.data);
        if (!data.isCorrect) {
          const key = event.exerciseId || 'unknown';
          errorTypes[key] = (errorTypes[key] || 0) + 1;
        }
      } catch (e) {
        // Ignorer les données malformées
      }
    });

    return Object.entries(errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  } catch (error) {
    console.error('Erreur récupération patterns erreur:', error);
    return [];
  }
}

function buildCorrectionPrompt(text, userProfile, errorPatterns, context) {
  let prompt = `Corrigez ce texte en français et fournissez une analyse détaillée.

TEXTE À CORRIGER:
"${text}"

INSTRUCTIONS:
1. Identifiez toutes les erreurs (orthographe, grammaire, conjugaison, style)
2. Proposez une version corrigée
3. Expliquez chaque correction brièvement
4. Donnez des conseils personnalisés pour éviter ces erreurs
5. Adaptez votre niveau d'explication au niveau de l'utilisateur

FORMAT DE RÉPONSE ATTENDU:
CORRIGÉ: [texte corrigé]
ERREURS: [liste des erreurs avec explications]
CONSEILS: [conseils personnalisés]`;

  if (userProfile) {
    prompt += `\n\nPROFIL UTILISATEUR:
- Niveau: ${userProfile.level}
- Précision: ${Math.round(userProfile.accuracy)}%
- Exercices complétés: ${userProfile.exercisesCompleted}`;
  }

  if (errorPatterns.length > 0) {
    prompt += `\n\nERREURS FRÉQUENTES DÉTECTÉES:
${errorPatterns.map(pattern => `- ${pattern.type}: ${pattern.count} erreurs`).join('\n')}
Concentrez-vous sur ces types d'erreurs dans vos conseils.`;
  }

  if (context) {
    prompt += `\n\nCONTEXTE: ${context}`;
  }

  return prompt;
}

function buildAnalysisPrompt(text, userProfile, context) {
  let prompt = `Analysez ce texte en français et fournissez des recommandations d'amélioration.

TEXTE À ANALYSER:
"${text}"

ANALYSE DEMANDÉE:
1. Niveau de complexité du texte
2. Points forts du texte
3. Points à améliorer
4. Suggestions d'enrichissement
5. Conseils pour progresser

FORMAT DE RÉPONSE ATTENDU:
NIVEAU: [débutant/intermédiaire/avancé]
POINTS FORTS: [liste des points positifs]
AMÉLIORATIONS: [suggestions d'amélioration]
RECOMMANDATIONS: [conseils personnalisés]`;

  if (userProfile) {
    prompt += `\n\nPROFIL UTILISATEUR:
- Niveau: ${userProfile.level}
- Précision: ${Math.round(userProfile.accuracy)}%`;
  }

  if (context) {
    prompt += `\n\nCONTEXTE: ${context}`;
  }

  return prompt;
}

function parseCorrections(aiResponse) {
  try {
    const lines = aiResponse.split('\n');
    let correctedText = '';
    let errors = [];
    let suggestions = [];
    let tips = [];

    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('CORRIGÉ:')) {
        currentSection = 'corrected';
        correctedText = trimmed.replace('CORRIGÉ:', '').trim();
      } else if (trimmed.startsWith('ERREURS:')) {
        currentSection = 'errors';
      } else if (trimmed.startsWith('CONSEILS:')) {
        currentSection = 'tips';
      } else if (trimmed.startsWith('SUGGESTIONS:')) {
        currentSection = 'suggestions';
      } else if (trimmed && currentSection === 'errors') {
        errors.push(trimmed);
      } else if (trimmed && currentSection === 'tips') {
        tips.push(trimmed);
      } else if (trimmed && currentSection === 'suggestions') {
        suggestions.push(trimmed);
      }
    });

    return {
      correctedText: correctedText || aiResponse,
      errors: errors.length > 0 ? errors : ['Aucune erreur détectée'],
      suggestions: suggestions,
      tips: tips
    };
  } catch (error) {
    console.error('Erreur parsing corrections:', error);
    return {
      correctedText: aiResponse,
      errors: ['Erreur lors de l\'analyse'],
      suggestions: [],
      tips: []
    };
  }
}

function parseAnalysis(aiResponse) {
  try {
    const lines = aiResponse.split('\n');
    let level = 'intermédiaire';
    let strengths = [];
    let improvements = [];
    let recommendations = [];

    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('NIVEAU:')) {
        level = trimmed.replace('NIVEAU:', '').trim().toLowerCase();
      } else if (trimmed.startsWith('POINTS FORTS:')) {
        currentSection = 'strengths';
      } else if (trimmed.startsWith('AMÉLIORATIONS:')) {
        currentSection = 'improvements';
      } else if (trimmed.startsWith('RECOMMANDATIONS:')) {
        currentSection = 'recommendations';
      } else if (trimmed && currentSection === 'strengths') {
        strengths.push(trimmed);
      } else if (trimmed && currentSection === 'improvements') {
        improvements.push(trimmed);
      } else if (trimmed && currentSection === 'recommendations') {
        recommendations.push(trimmed);
      }
    });

    return {
      level,
      strengths: strengths.length > 0 ? strengths : ['Texte bien structuré'],
      improvements: improvements.length > 0 ? improvements : ['Continuez à pratiquer'],
      recommendations: recommendations
    };
  } catch (error) {
    console.error('Erreur parsing analyse:', error);
    return {
      level: 'intermédiaire',
      strengths: ['Texte analysé'],
      improvements: ['Continuez à pratiquer'],
      recommendations: []
    };
  }
}

function analyzeTextComplexity(text) {
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentenceCount;
  
  let complexity = 'beginner';
  if (avgWordsPerSentence > 15) complexity = 'advanced';
  else if (avgWordsPerSentence > 10) complexity = 'intermediate';
  
  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    complexity
  };
}

module.exports = router;
