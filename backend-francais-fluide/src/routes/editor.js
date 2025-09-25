// src/routes/editor.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/editor/save - Sauvegarder le contenu de l'éditeur
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { content, title, type = 'document' } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Le contenu est requis'
      });
    }

    // Sauvegarder le document
    const document = await prisma.document.create({
      data: {
        title: title || 'Document sans titre',
        content,
        type,
        userId
      }
    });

    res.json({
      success: true,
      data: {
        id: document.id,
        title: document.title,
        content: document.content,
        type: document.type,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur sauvegarde éditeur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la sauvegarde'
    });
  }
});

// GET /api/editor/documents - Récupérer les documents de l'utilisateur
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Erreur récupération documents:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des documents'
    });
  }
});

// GET /api/editor/documents/:id - Récupérer un document spécifique
router.get('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Erreur récupération document:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du document'
    });
  }
});

// PUT /api/editor/documents/:id - Mettre à jour un document
router.put('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title } = req.body;
    const userId = req.user.userId;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document non trouvé'
      });
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        content,
        title: title || document.title
      }
    });

    res.json({
      success: true,
      data: updatedDocument
    });

  } catch (error) {
    console.error('Erreur mise à jour document:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du document'
    });
  }
});

// DELETE /api/editor/documents/:id - Supprimer un document
router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document non trouvé'
      });
    }

    await prisma.document.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression document:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du document'
    });
  }
});

module.exports = router;
