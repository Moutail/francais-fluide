// src/routes/subscription.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { subscriptionService } = require('../services/subscriptionService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateSubscription = [
  body('plan').isIn(['demo', 'etudiant', 'premium', 'etablissement']).withMessage('Plan invalide'),
  body('paymentMethodId').optional().isString().withMessage('paymentMethodId doit être une chaîne de caractères')
];

// GET /api/subscription/plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'demo',
        name: 'Démo Gratuite',
        price: 0,
        currency: 'CAD',
        interval: 'month',
        features: [
          '10 corrections par jour',
          '5 exercices par jour',
          'Assistant IA basique',
          'Progression limitée'
        ],
        limits: {
          corrections: 10,
          exercises: 5,
          aiChat: 5
        }
      },
      {
        id: 'etudiant',
        name: 'Étudiant',
        price: 1499, // 14.99 CAD en centimes
        currency: 'CAD',
        interval: 'month',
        features: [
          '100 corrections par jour',
          '50 exercices par jour',
          'Assistant IA complet',
          'Progression complète',
          'Analytics détaillées'
        ],
        limits: {
          corrections: 100,
          exercises: 50,
          aiChat: 100
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 2999, // 29.99 CAD en centimes
        currency: 'CAD',
        interval: 'month',
        features: [
          'Corrections illimitées',
          'Exercices illimités',
          'Assistant IA avancé',
          'Assistant de rédaction de dissertations',
          'Entraînement dissertations (argumentative, comparative, poème)',
          'Correction intelligente avec feedback personnalisé',
          'Analytics avancées',
          'Support prioritaire'
        ],
        limits: {
          corrections: -1, // Illimité
          exercises: -1,
          aiChat: -1
        }
      },
      {
        id: 'etablissement',
        name: 'Établissement',
        price: 14999, // 149.99 CAD en centimes
        currency: 'CAD',
        interval: 'month',
        features: [
          'Gestion multi-utilisateurs',
          'Assistant de rédaction de dissertations',
          'Outils pédagogiques avancés',
          'Suivi de progression par classe',
          'API complète',
          'Support prioritaire 24/7',
          'Analytics institutionnelles',
          'Intégration LMS'
        ],
        limits: {
          corrections: -1,
          exercises: -1,
          aiChat: -1,
          users: -1
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Erreur récupération plans:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/subscription/current
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Aucun abonnement trouvé'
      });
    }

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/subscription/subscribe
router.post('/subscribe', authenticateToken, validateSubscription, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { plan, paymentMethodId } = req.body;
    const userId = req.user.userId;

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Un abonnement actif existe déjà'
      });
    }

    // Créer l'intent de paiement Stripe
    const paymentIntent = await subscriptionService.createPaymentIntent({
      plan,
      userId,
      paymentMethodId
    });

    // Créer l'abonnement en attente
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        stripePaymentIntentId: paymentIntent.id
      }
    });

    res.json({
      success: true,
      data: {
        subscription,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret
        }
      }
    });

  } catch (error) {
    console.error('Erreur création abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/subscription/confirm
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.userId;

    // Vérifier le paiement avec Stripe
    const paymentIntent = await subscriptionService.confirmPayment(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Paiement non confirmé'
      });
    }

    // Activer l'abonnement
    const subscription = await prisma.subscription.update({
      where: {
        userId_stripePaymentIntentId: {
          userId,
          stripePaymentIntentId: paymentIntentId
        }
      },
      data: {
        status: 'active',
        startDate: new Date()
      }
    });

    res.json({
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Erreur confirmation abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/subscription/cancel
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Aucun abonnement trouvé'
      });
    }

    // Annuler l'abonnement Stripe
    await subscriptionService.cancelSubscription(subscription.stripeSubscriptionId);

    // Mettre à jour l'abonnement
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'cancelled',
        endDate: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedSubscription
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
