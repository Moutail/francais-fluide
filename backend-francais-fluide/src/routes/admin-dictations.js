// src/routes/admin-dictations.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const OpenAI = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');

const router = express.Router();
const prisma = new PrismaClient();

let anthropicClient = null;
function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
}

let openaiClient = null;
function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  if (!process.env.OPENAI_API_KEY) return null;
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function generateDictationJsonWithOpenAI({ prompt }) {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI non configuré (OPENAI_API_KEY manquante)');
  }

  const response = await openai.chat.completions.create({
    model: getOpenAIModel(),
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1800,
    temperature: 0.7
  });

  return response?.choices?.[0]?.message?.content || '';
}

function estimateDurationMinutesFromText(text) {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  // Hypothèse ~130 mots/min
  const minutes = Math.max(1, Math.ceil(words / 130));
  return Math.min(60, minutes);
}

async function synthesizeElevenLabsToFile({ text, filename }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY manquante');
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.75
      }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Erreur ElevenLabs (HTTP ${resp.status})${errText ? `: ${errText}` : ''}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = path.join(__dirname, '../../public/audio/dictations');
  await fs.mkdir(uploadDir, { recursive: true });

  const outPath = path.join(uploadDir, filename);
  await fs.writeFile(outPath, buffer);

  return {
    audioUrl: `/audio/dictations/${filename}`,
    size: buffer.length
  };
}

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

// GET /api/admin/dictations - Liste des dictées
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      difficulty,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {};
    
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [dictations, totalDictations] = await Promise.all([
      prisma.dictation.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.dictation.count({ where: whereClause })
    ]);

    // Statistiques des dictées
    const stats = await Promise.all([
      prisma.dictation.count(),
      prisma.dictation.count({ where: { completed: true } }),
      prisma.dictation.groupBy({
        by: ['difficulty'],
        _count: true
      }),
      prisma.dictation.aggregate({
        _avg: { attempts: true, score: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        dictations,
        stats: {
          total: stats[0],
          completed: stats[1],
          byDifficulty: stats[2],
          averageAttempts: Math.round(stats[3]._avg.attempts || 0),
          averageScore: Math.round(stats[3]._avg.score || 0)
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalDictations,
          pages: Math.ceil(totalDictations / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération dictées admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/dictations - Créer une dictée
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Titre invalide'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Difficulté invalide'),
    body('duration').isInt({ min: 1, max: 60 }).withMessage('Durée invalide (1-60 minutes)'),
    body('text').trim().isLength({ min: 50, max: 5000 }).withMessage('Texte invalide'),
    body('audioUrl').optional().custom((value) => {
      if (!value) return true;
      if (typeof value !== 'string') {
        throw new Error('URL audio invalide');
      }
      // On accepte les URLs absolues (http/https) ou les chemins relatifs servis par l'app
      // ex: /audio/dictations/mon-fichier.mp3
      if (value.startsWith('/')) return true;
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
      } catch {
        throw new Error('URL audio invalide');
      }
    }),
    body('category').optional().trim().isLength({ max: 50 }),
    body('tags').optional().isArray()
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

      const { 
        title, 
        description, 
        difficulty, 
        duration, 
        text, 
        audioUrl, 
        category,
        tags 
      } = req.body;

      const dictation = await prisma.dictation.create({
        data: {
          title,
          description,
          difficulty,
          duration,
          text,
          audioUrl,
          category,
          tags: tags ? JSON.stringify(tags) : null
        }
      });

      res.status(201).json({
        success: true,
        data: dictation,
        message: 'Dictée créée avec succès'
      });

    } catch (error) {
      console.error('Erreur création dictée:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// POST /api/admin/dictations/generate - Générer une dictée avec l'IA (admin)
router.post('/generate',
  authenticateToken,
  requireAdmin,
  [
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Difficulté invalide'),
    body('theme').optional().isString().isLength({ max: 120 }).withMessage('Thème invalide'),
    body('category').optional().isString().isLength({ max: 50 }).withMessage('Catégorie invalide'),
    body('withAudio').optional().isBoolean().withMessage('withAudio invalide'),
    body('targetMinutes').optional().isInt({ min: 1, max: 10 }).withMessage('targetMinutes invalide (1-10)')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Données invalides', details: errors.array() });
      }

      const anthropic = getAnthropicClient();
      const openai = getOpenAIClient();
      if (!anthropic && !openai) {
        return res.status(500).json({
          success: false,
          error: 'Aucun provider IA configuré (ANTHROPIC_API_KEY ou OPENAI_API_KEY requis)'
        });
      }

      const { difficulty, theme = 'général', category = '', withAudio = false, targetMinutes = 3 } = req.body;

      const prompt = `Tu es un créateur de dictées en français.
Génère UNE dictée originale adaptée au niveau: ${difficulty}.
Thème: ${theme}.
Durée cible: ${targetMinutes} minutes.

Contraintes:
- Le champ "text" doit être un texte continu (1 à 4 paragraphes max), entre 80 et 900 mots.
- Le texte doit être parfaitement en français, sans listes ni puces.
- Donne un "title" court.
- Donne une "description" courte.
- Donne "tags" comme tableau de 2 à 6 tags.

Réponds UNIQUEMENT en JSON valide avec exactement ces clés:
{ "title": string, "description": string, "text": string, "tags": string[] }`;

      let raw = '';
      let providerUsed = null;
      // 1) Essayer Anthropic si disponible
      if (anthropic) {
        try {
          const aiResp = await anthropic.messages.create({
            model: getAnthropicModel(),
            max_tokens: 1800,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }]
          });
          raw = aiResp?.content?.[0]?.text || '';
          providerUsed = 'anthropic';
        } catch (err) {
          const status = err?.status;
          const message = err?.error?.error?.message || err?.message || '';
          const isModelNotFound = status === 404 && String(message).toLowerCase().includes('model');
          if (!isModelNotFound || !openai) {
            throw err;
          }
          // 2) Fallback OpenAI si le modèle Anthropic est indisponible
        }
      }

      if (!raw) {
        raw = await generateDictationJsonWithOpenAI({ prompt });
        providerUsed = 'openai';
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return res.status(500).json({
          success: false,
          error: 'Réponse IA non-JSON',
          provider: providerUsed,
          raw
        });
      }

      const title = String(parsed.title || '').trim();
      const description = String(parsed.description || '').trim();
      const text = String(parsed.text || '').trim();
      const tags = Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).trim()).filter(Boolean) : [];

      if (title.length < 2 || text.length < 50) {
        return res.status(500).json({ success: false, error: 'Réponse IA invalide (title/text trop courts)', raw });
      }

      const duration = estimateDurationMinutesFromText(text);

      let audioUrl = null;
      let audioMeta = null;
      if (withAudio) {
        const safeBase = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 40) || 'dictee';
        const filename = `${safeBase}-${Date.now()}.mp3`;
        const audio = await synthesizeElevenLabsToFile({ text, filename });
        audioUrl = audio.audioUrl;
        audioMeta = { size: audio.size, provider: 'elevenlabs' };
      }

      const dictation = await prisma.dictation.create({
        data: {
          title,
          description,
          difficulty,
          duration,
          text,
          audioUrl,
          category: category || null,
          tags: tags.length ? JSON.stringify(tags) : null
        }
      });

      return res.status(201).json({
        success: true,
        data: dictation,
        meta: {
          generatedBy: providerUsed,
          audio: audioMeta,
          estimatedDurationMinutes: duration
        }
      });
    } catch (error) {
      console.error('Erreur génération dictée IA:', error);
      const status = error?.status;
      const message = error?.error?.error?.message || error?.message || 'Erreur interne du serveur';
      if (status === 404 && String(message).toLowerCase().includes('model')) {
        return res.status(500).json({
          success: false,
          error: `Modèle IA introuvable: ${message}`,
          hint: 'Définissez ANTHROPIC_MODEL avec un modèle disponible sur votre compte, ou utilisez OPENAI_API_KEY/OPENAI_MODEL pour le fallback.'
        });
      }
      return res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/admin/dictations/:id - Détails d'une dictée
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const dictation = await prisma.dictation.findUnique({
      where: { id }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    // Statistiques d'utilisation
    const usageStats = await prisma.usageLog.findMany({
      where: {
        type: 'dictation',
        details: {
          contains: `"dictationId":"${id}"`
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    const attempts = usageStats.map(log => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          score: details.score || 0,
          timeSpent: details.timeSpent || 0,
          wordCount: details.wordCount || 0,
          date: log.createdAt
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    const avgScore = attempts.length > 0 ? 
      Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0;

    res.json({
      success: true,
      data: {
        dictation,
        stats: {
          totalAttempts: attempts.length,
          averageScore: avgScore,
          recentAttempts: attempts.slice(0, 10)
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/admin/dictations/:id - Modifier une dictée
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('duration').optional().isInt({ min: 1, max: 60 }),
    body('text').optional().trim().isLength({ min: 50, max: 5000 }),
    body('audioUrl').optional().custom((value) => {
      if (!value) return true;
      if (typeof value !== 'string') {
        throw new Error('Invalid value');
      }
      if (value.startsWith('/')) return true;
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
      } catch {
        throw new Error('Invalid value');
      }
    }),
    body('category').optional().trim().isLength({ max: 50 }),
    body('tags').optional().isArray()
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
      const { 
        title, 
        description, 
        difficulty, 
        duration, 
        text, 
        audioUrl, 
        category,
        tags 
      } = req.body;

      const dictation = await prisma.dictation.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(difficulty && { difficulty }),
          ...(duration && { duration }),
          ...(text && { text }),
          ...(audioUrl !== undefined && { audioUrl }),
          ...(category !== undefined && { category }),
          ...(tags && { tags: JSON.stringify(tags) })
        }
      });

      res.json({
        success: true,
        data: dictation,
        message: 'Dictée modifiée avec succès'
      });

    } catch (error) {
      console.error('Erreur modification dictée:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// DELETE /api/admin/dictations/:id - Supprimer une dictée
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la dictée existe
    const dictation = await prisma.dictation.findUnique({
      where: { id }
    });

    if (!dictation) {
      return res.status(404).json({
        success: false,
        error: 'Dictée non trouvée'
      });
    }

    await prisma.dictation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Dictée supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression dictée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/admin/dictations/bulk-action - Actions en lot
router.post('/bulk-action',
  authenticateToken,
  requireAdmin,
  [
    body('action').isIn(['delete', 'difficulty', 'category']).withMessage('Action invalide'),
    body('dictationIds').isArray({ min: 1 }).withMessage('IDs de dictées requis'),
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

      const { action, dictationIds, value } = req.body;

      let result;

      switch (action) {
        case 'delete':
          result = await prisma.dictation.deleteMany({
            where: { id: { in: dictationIds } }
          });
          break;
        
        case 'difficulty':
          if (!value || !['beginner', 'intermediate', 'advanced'].includes(value)) {
            return res.status(400).json({
              success: false,
              error: 'Difficulté invalide'
            });
          }
          result = await prisma.dictation.updateMany({
            where: { id: { in: dictationIds } },
            data: { difficulty: value }
          });
          break;
        
        case 'category':
          result = await prisma.dictation.updateMany({
            where: { id: { in: dictationIds } },
            data: { category: value }
          });
          break;
      }

      res.json({
        success: true,
        data: {
          affected: result.count
        },
        message: `${result.count} dictée(s) traitée(s) avec succès`
      });

    } catch (error) {
      console.error('Erreur action en lot dictées:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  }
);

// GET /api/admin/dictations/stats/performance - Statistiques de performance
router.get('/stats/performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Récupérer les tentatives récentes
    const recentAttempts = await prisma.usageLog.findMany({
      where: {
        type: 'dictation',
        createdAt: { gte: daysAgo }
      }
    });

    const attemptData = recentAttempts.map(log => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          dictationId: details.dictationId,
          score: details.score || 0,
          timeSpent: details.timeSpent || 0,
          date: log.createdAt
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Calculer les statistiques
    const totalAttempts = attemptData.length;
    const averageScore = totalAttempts > 0 ? 
      Math.round(attemptData.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;
    
    const averageTime = totalAttempts > 0 ? 
      Math.round(attemptData.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts) : 0;

    // Dictées les plus populaires
    const popularDictations = {};
    attemptData.forEach(attempt => {
      if (!popularDictations[attempt.dictationId]) {
        popularDictations[attempt.dictationId] = 0;
      }
      popularDictations[attempt.dictationId]++;
    });

    const topDictations = Object.entries(popularDictations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        overview: {
          totalAttempts,
          averageScore,
          averageTime,
          period: parseInt(period)
        },
        popular: topDictations.map(([id, count]) => ({
          dictationId: id,
          attempts: count
        })),
        trends: {
          daily: [] // À implémenter si nécessaire
        }
      }
    });

  } catch (error) {
    console.error('Erreur statistiques performance dictées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
