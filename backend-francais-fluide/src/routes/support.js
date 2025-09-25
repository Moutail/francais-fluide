const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

// POST /api/support/contact - Envoyer un message de contact
router.post('/contact', authenticateToken, async (req, res) => {
  try {
    const { subject, category, priority, description } = req.body;
    const userId = req.user.id;

    // Validation des données
    if (!subject || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Créer le ticket de support
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        category,
        priority: priority || 'medium',
        description,
        status: 'open',
        userId
      }
    });

    res.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès',
      data: ticket
    });

  } catch (error) {
    console.error('Erreur création ticket support:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de votre demande'
    });
  }
});

// GET /api/support/tickets - Récupérer les tickets de l'utilisateur
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tickets
    });

  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos demandes'
    });
  }
});

// GET /api/support/tickets/:id - Récupérer un ticket spécifique
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.supportTicket.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du ticket'
    });
  }
});

// PUT /api/support/tickets/:id - Mettre à jour un ticket
router.put('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const ticket = await prisma.supportTicket.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: { 
        status: status || ticket.status,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ticket mis à jour avec succès',
      data: updatedTicket
    });

  } catch (error) {
    console.error('Erreur mise à jour ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du ticket'
    });
  }
});

module.exports = router;

