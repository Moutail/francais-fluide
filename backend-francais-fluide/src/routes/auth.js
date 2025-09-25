// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Validation middleware
const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      // Créer la progression initiale
      await tx.userProgress.create({
        data: {
          userId: user.id,
          wordsWritten: 0,
          accuracy: 0,
          timeSpent: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0
        }
      });

      // Créer l'abonnement démo
      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'demo',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        }
      });

      return user;
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: result.id, email: result.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name
      },
      token
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur interne du serveur' 
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        progress: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Mettre à jour la dernière activité et connexion
    await Promise.all([
      user.progress ? prisma.userProgress.update({
        where: { userId: user.id },
        data: { lastActivity: new Date() }
      }) : Promise.resolve(),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
    ]);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        progress: user.progress,
        subscription: user.subscription
      },
      token
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Middleware de vérification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token d\'authentification requis' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: 'Token invalide' 
      });
    }
    req.user = user;
    next();
  });
};

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        progress: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        progress: user.progress,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur interne du serveur' 
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Générer un nouveau token
    const token = jwt.sign(
      { userId: req.user.userId, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur interne du serveur' 
    });
  }
});

module.exports = router;
