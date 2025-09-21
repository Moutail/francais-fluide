// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'authentification requis' 
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        progress: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token invalide' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré' 
      });
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur d\'authentification' 
    });
  }
};

// Middleware d'autorisation par plan
const requireSubscription = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user?.subscription?.plan || 'demo';
    
    const planHierarchy = {
      'demo': 0,
      'etudiant': 1,
      'premium': 2,
      'etablissement': 3
    };

    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return res.status(403).json({
        error: 'Plan d\'abonnement insuffisant',
        required: requiredPlan,
        current: userPlan
      });
    }

    next();
  };
};

// Middleware de vérification des quotas
const checkQuota = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les quotas de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    const plan = user.subscription?.plan || 'demo';
    const quotas = {
      'demo': { corrections: 10, exercises: 5 },
      'etudiant': { corrections: 100, exercises: 50 },
      'premium': { corrections: -1, exercises: -1 }, // Illimité
      'etablissement': { corrections: -1, exercises: -1 }
    };

    const userQuota = quotas[plan];
    
    // Vérifier les quotas (si pas illimité)
    if (userQuota.corrections !== -1) {
      const todayUsage = await prisma.usageLog.count({
        where: {
          userId,
          type: 'correction',
          createdAt: {
            gte: today
          }
        }
      });

      if (todayUsage >= userQuota.corrections) {
        return res.status(429).json({
          error: 'Quota de corrections atteint',
          quota: userQuota.corrections,
          used: todayUsage,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        });
      }
    }

    req.userQuota = userQuota;
    next();
  } catch (error) {
    console.error('Erreur de vérification des quotas:', error);
    res.status(500).json({ 
      error: 'Erreur de vérification des quotas' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireSubscription,
  checkQuota
};
