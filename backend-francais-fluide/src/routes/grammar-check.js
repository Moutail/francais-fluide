// src/routes/grammar-check.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { OpenAI } = require('openai');

const router = express.Router();
const prisma = new PrismaClient();

// Système de correction grammaticale de fallback
function performFallbackGrammarCheck(text) {
  const errors = [];
  let correctedText = text;
  
  // Règles de correction de base (plus précises)
  const rules = [
    // Corrections d'orthographe courantes (plus spécifiques)
    { pattern: /\ba\s+(l[ae]|école|maison|voiture|table|chaise|école|université|travail|bureau|magasin|restaurant|cinéma|théâtre|musée|parc|jardin|plage|montagne|ville|pays|monde)\b/g, replacement: 'à $1', type: 'orthographe', explanation: 'Utilisez "à" avec l\'accent grave pour indiquer la direction' },
    { pattern: /\bca\b/g, replacement: 'ça', type: 'orthographe', explanation: 'Utilisez "ça" avec la cédille pour le pronom démonstratif' },
    { pattern: /\bdeja\b/g, replacement: 'déjà', type: 'orthographe', explanation: 'Utilisez "déjà" avec les accents' },
    { pattern: /\bapres\b/g, replacement: 'après', type: 'orthographe', explanation: 'Utilisez "après" avec l\'accent grave' },
    { pattern: /\bavant\b/g, replacement: 'avant', type: 'orthographe', explanation: 'Utilisez "avant" sans accent' },
    { pattern: /\bavec\b/g, replacement: 'avec', type: 'orthographe', explanation: 'Utilisez "avec" sans accent' },
    { pattern: /\bsans\b/g, replacement: 'sans', type: 'orthographe', explanation: 'Utilisez "sans" sans accent' },
    { pattern: /\bmais\b/g, replacement: 'mais', type: 'orthographe', explanation: 'Utilisez "mais" sans accent' },
    { pattern: /\bdonc\b/g, replacement: 'donc', type: 'orthographe', explanation: 'Utilisez "donc" sans accent' },
    { pattern: /\bcar\b/g, replacement: 'car', type: 'orthographe', explanation: 'Utilisez "car" sans accent' },
    
    // Corrections de conjugaison courantes (être + participe passé)
    { pattern: /\bje suis aller\b/g, replacement: 'je suis allé', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\btu es aller\b/g, replacement: 'tu es allé', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\bil est aller\b/g, replacement: 'il est allé', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\belle est aller\b/g, replacement: 'elle est allée', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\bnous sommes aller\b/g, replacement: 'nous sommes allés', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\bvous êtes aller\b/g, replacement: 'vous êtes allés', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\bils sont aller\b/g, replacement: 'ils sont allés', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\belles sont aller\b/g, replacement: 'elles sont allées', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    
    // Autres verbes avec être
    { pattern: /\bje suis venu\b/g, replacement: 'je suis venu', type: 'conjugaison', explanation: 'Correct' },
    { pattern: /\belle est venu\b/g, replacement: 'elle est venue', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    { pattern: /\bje suis sorti\b/g, replacement: 'je suis sorti', type: 'conjugaison', explanation: 'Correct' },
    { pattern: /\belle est sorti\b/g, replacement: 'elle est sortie', type: 'conjugaison', explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet' },
    
    // Corrections de grammaire (prépositions)
    { pattern: /\bje vais a\b/g, replacement: 'je vais à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\btu vas a\b/g, replacement: 'tu vas à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\bil va a\b/g, replacement: 'il va à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\belle va a\b/g, replacement: 'elle va à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\bnous allons a\b/g, replacement: 'nous allons à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\bvous allez a\b/g, replacement: 'vous allez à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\bils vont a\b/g, replacement: 'ils vont à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    { pattern: /\belles vont a\b/g, replacement: 'elles vont à', type: 'grammaire', explanation: 'Utilisez "à" avec l\'accent grave après "aller"' },
    
    // Autres prépositions
    { pattern: /\bje vais de\b/g, replacement: 'je vais de', type: 'grammaire', explanation: 'Correct' },
    { pattern: /\bje vais en\b/g, replacement: 'je vais en', type: 'grammaire', explanation: 'Correct' },
    { pattern: /\bje vais sur\b/g, replacement: 'je vais sur', type: 'grammaire', explanation: 'Correct' },
    { pattern: /\bje vais dans\b/g, replacement: 'je vais dans', type: 'grammaire', explanation: 'Correct' },
    
    // Corrections d'accord
    { pattern: /\bun ecole\b/g, replacement: 'une école', type: 'accord', explanation: '"École" est féminin, utilisez "une"' },
    { pattern: /\bun maison\b/g, replacement: 'une maison', type: 'accord', explanation: '"Maison" est féminin, utilisez "une"' },
    { pattern: /\bun voiture\b/g, replacement: 'une voiture', type: 'accord', explanation: '"Voiture" est féminin, utilisez "une"' },
    { pattern: /\bun table\b/g, replacement: 'une table', type: 'accord', explanation: '"Table" est féminin, utilisez "une"' },
    { pattern: /\bun chaise\b/g, replacement: 'une chaise', type: 'accord', explanation: '"Chaise" est féminin, utilisez "une"' },
    
    // Corrections de ponctuation (plus précises)
    { pattern: /\s{2,}/g, replacement: ' ', type: 'ponctuation', explanation: 'Évitez les espaces multiples' },
    { pattern: /\s+([.!?])/g, replacement: '$1', type: 'ponctuation', explanation: 'Pas d\'espace avant la ponctuation finale' },
    { pattern: /([.!?])([a-z])/g, replacement: '$1 $2', type: 'ponctuation', explanation: 'Espace après la ponctuation finale' },
  ];
  
  // Appliquer les règles de correction (une seule fois par règle)
  rules.forEach((rule, index) => {
    const matches = correctedText.match(rule.pattern);
    if (matches) {
      // Éviter les doublons d'erreurs
      const existingErrors = errors.filter(e => e.original === matches[0] && e.type === rule.type);
      if (existingErrors.length === 0) {
        matches.forEach(match => {
          const position = correctedText.indexOf(match);
          errors.push({
            original: match,
            corrected: rule.replacement,
            explanation: rule.explanation,
            position: position,
            type: rule.type
          });
        });
      }
      correctedText = correctedText.replace(rule.pattern, rule.replacement);
    }
  });
  
  return {
    correctedText,
    errors
  };
}

// Fonction pour utiliser LanguageTool
async function checkWithLanguageTool(text, language = 'fr') {
  try {
    const response = await fetch(`${process.env.LANGUAGE_TOOL_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: language,
        enabledOnly: 'false'
      })
    });

    if (!response.ok) {
      throw new Error(`LanguageTool error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.matches || data.matches.length === 0) {
      return {
        originalText: text,
        correctedText: text,
        errors: []
      };
    }

    // Convertir les erreurs de LanguageTool au format attendu
    const errors = data.matches.map((match, index) => ({
      original: text.substring(match.offset, match.offset + match.length),
      corrected: match.replacements && match.replacements.length > 0 ? match.replacements[0].value : match.context.substring(match.offset - match.contextOffset, match.offset - match.contextOffset + match.length),
      explanation: match.message,
      position: match.offset,
      type: match.rule.category.name || 'grammaire'
    }));

    // Appliquer les corrections
    let correctedText = text;
    let offsetAdjustment = 0;
    
    // Trier les erreurs par position décroissante pour éviter les problèmes d'index
    const sortedErrors = errors.sort((a, b) => b.position - a.position);
    
    sortedErrors.forEach(error => {
      const start = error.position + offsetAdjustment;
      const end = start + error.original.length;
      correctedText = correctedText.substring(0, start) + error.corrected + correctedText.substring(end);
      offsetAdjustment += error.corrected.length - error.original.length;
    });

    return {
      originalText: text,
      correctedText,
      errors
    };

  } catch (error) {
    console.error('Erreur LanguageTool:', error);
    return null;
  }
}

// Fonction pour utiliser OpenAI
async function checkWithOpenAI(text, language = 'fr') {
  try {
    const prompt = `Tu es un expert en grammaire française. Analyse le texte suivant et identifie toutes les erreurs grammaticales, orthographiques et de conjugaison. 

Retourne une réponse au format JSON avec :
- "correctedText": le texte corrigé
- "errors": un tableau d'objets avec :
  - "original": le texte incorrect
  - "corrected": la correction
  - "explanation": l'explication de l'erreur
  - "position": la position de l'erreur dans le texte
  - "type": le type d'erreur (grammaire, orthographe, conjugaison, etc.)

Texte à analyser: "${text}"

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en grammaire française. Analyse les textes et fournis des corrections détaillées au format JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Parser la réponse JSON de l'IA
    let correctionResult;
    try {
      correctionResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erreur parsing réponse OpenAI:', parseError);
      return null;
    }

    return {
      originalText: text,
      correctedText: correctionResult.correctedText || text,
      errors: correctionResult.errors || []
    };

  } catch (error) {
    console.error('Erreur OpenAI:', error);
    return null;
  }
}

// Fonction pour utiliser Anthropic
async function checkWithAnthropic(text, language = 'fr') {
  try {
    const prompt = `Tu es un expert en grammaire française. Analyse le texte suivant et identifie toutes les erreurs grammaticales, orthographiques et de conjugaison. 

Retourne une réponse au format JSON avec :
- "correctedText": le texte corrigé
- "errors": un tableau d'objets avec :
  - "original": le texte incorrect
  - "corrected": la correction
  - "explanation": l'explication de l'erreur
  - "position": la position de l'erreur dans le texte
  - "type": le type d'erreur (grammaire, orthographe, conjugaison, etc.)

Texte à analyser: "${text}"

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const aiResponse = message.content[0].text;
    
    // Parser la réponse JSON de l'IA
    let correctionResult;
    try {
      correctionResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erreur parsing réponse Anthropic:', parseError);
      return null;
    }

    return {
      originalText: text,
      correctedText: correctionResult.correctedText || text,
      errors: correctionResult.errors || []
    };

  } catch (error) {
    console.error('Erreur Anthropic:', error);
    return null;
  }
}

// Configuration OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Configuration Anthropic
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-...') {
  const { Anthropic } = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

// POST /api/grammar-check - Vérifier la grammaire d'un texte
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const { text, language = 'fr' } = req.body;
    const userId = req.user.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Le texte à vérifier est requis'
      });
    }

    // Essayer d'abord OpenAI (le plus puissant)
    if (openai) {
      try {
        const openaiResult = await checkWithOpenAI(text, language);
        if (openaiResult) {
          return res.json({
            success: true,
            data: openaiResult,
            fallback: false,
            service: 'openai'
          });
        }
      } catch (error) {
        console.log('OpenAI non disponible, essai Anthropic');
      }
    }

    // Essayer Anthropic en fallback
    if (anthropic) {
      try {
        const anthropicResult = await checkWithAnthropic(text, language);
        if (anthropicResult) {
          return res.json({
            success: true,
            data: anthropicResult,
            fallback: false,
            service: 'anthropic'
          });
        }
      } catch (error) {
        console.log('Anthropic non disponible, essai LanguageTool');
      }
    }

    // Essayer LanguageTool
    if (process.env.LANGUAGE_TOOL_URL && process.env.LANGUAGE_TOOL_URL !== 'https://api.languagetool.org/v2') {
      try {
        const languageToolResult = await checkWithLanguageTool(text, language);
        if (languageToolResult) {
          return res.json({
            success: true,
            data: languageToolResult,
            fallback: false,
            service: 'languagetool'
          });
        }
      } catch (error) {
        console.log('LanguageTool non disponible, utilisation du fallback');
      }
    }
    
    // Système de correction grammaticale de fallback
    const fallbackResult = performFallbackGrammarCheck(text);
      
    // Mettre à jour le compteur d'utilisation même en mode fallback
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    if (!dailyUsage) {
      dailyUsage = await prisma.dailyUsage.create({
        data: {
          userId,
          date: today,
          aiExercisesGenerated: 0,
          aiCorrectionsUsed: 0
        }
      });
    }

    await prisma.dailyUsage.update({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      data: {
        aiCorrectionsUsed: dailyUsage.aiCorrectionsUsed + 1
      }
    });

    return res.json({
      success: true,
      data: {
        originalText: text,
        correctedText: fallbackResult.correctedText,
        errors: fallbackResult.errors,
        usage: {
          current: dailyUsage.aiCorrectionsUsed + 1,
          limit: -1,
          remaining: -1
        },
        fallback: true
      }
    });

  } catch (error) {
    console.error('Erreur correction grammaticale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la correction grammaticale'
    });
  }
});

module.exports = router;
