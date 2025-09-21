// src/routes/ai.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkQuota } = require('../middleware/auth');
const { aiService } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateChatMessage = [
  body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Le message doit contenir entre 1 et 2000 caractères'),
  body('context').optional().isString().withMessage('Le contexte doit être une chaîne de caractères'),
  body('conversationId').optional().isString().withMessage('conversationId doit être une chaîne de caractères')
];

// POST /api/ai/chat
router.post('/chat', authenticateToken, checkQuota, validateChatMessage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { message, context, conversationId } = req.body;
    const userId = req.user.userId;

    // Récupérer ou créer la conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.substring(0, 50) + '...',
          messages: {
            create: {
              role: 'user',
              content: message,
              context: context || ''
            }
          }
        },
        include: { messages: true }
      });
    } else {
      // Ajouter le message utilisateur
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message,
          context: context || ''
        }
      });
    }

    // Générer la réponse IA
    const aiResponse = await aiService.generateResponse(message, {
      context,
      conversationHistory: conversation.messages.slice(-10), // Derniers 10 messages
      userId
    });

    // Sauvegarder la réponse IA
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse.content,
        context: JSON.stringify(aiResponse.context || {})
      }
    });

    // Enregistrer l'usage
    await prisma.usageLog.create({
      data: {
        userId,
        type: 'ai_chat',
        details: {
          messageLength: message.length,
          conversationId: conversation.id
        }
      }
    });

    res.json({
      success: true,
      data: {
        response: aiResponse.content,
        conversationId: conversation.id,
        context: aiResponse.context
      }
    });

  } catch (error) {
    console.error('Erreur chat IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/ai/conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/ai/conversations/:id
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation non trouvée'
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Erreur récupération conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/ai/conversations/:id
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation non trouvée'
      });
    }

    await prisma.conversation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Conversation supprimée'
    });

  } catch (error) {
    console.error('Erreur suppression conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
