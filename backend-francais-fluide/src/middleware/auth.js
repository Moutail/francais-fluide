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
        role: true,
        isActive: true,
        subscription: true,
        progress: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      subscription: user.subscription,
      progress: user.progress
    };
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
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les quotas de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    const plan = user.subscription?.plan || 'demo';
    const quotas = {
      'demo': { corrections: 10, exercises: 5, dictations: 0 }, // 0 dictées pour le plan gratuit
      'etudiant': { corrections: 100, exercises: 50, dictations: 10 },
      'premium': { corrections: -1, exercises: -1, dictations: -1 }, // Illimité
      'etablissement': { corrections: -1, exercises: -1, dictations: -1 }
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

// Middleware pour vérifier que l'utilisateur est admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentification requise'
    });
  }

  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès refusé. Droits administrateur requis.',
      userRole: req.user.role
    });
  }

  next();
};

// Middleware spécifique pour les dictées
const checkDictationQuota = async (req, res, next) => {
  try {
    console.log('🔍 checkDictationQuota - Vérification quota dictées');
    console.log('📋 req.user:', req.user);
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('❌ Pas d\'userId dans req.user');
      return res.status(401).json({ 
        success: false,
        error: 'Non authentifié' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Récupérer les quotas de l'utilisateur
    console.log('📊 Récupération utilisateur:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    const plan = user.subscription?.plan || 'demo';
    console.log('✅ Plan utilisateur:', plan);
    console.log('📦 Subscription complète:', user.subscription);
    
    const quotas = {
      'demo': { dictations: 0 }, // 0 dictées pour le plan gratuit
      'etudiant': { dictations: 10 },
      'premium': { dictations: -1 }, // Illimité
      'etablissement': { dictations: -1 }
    };

    const userQuota = quotas[plan];
    
    // Vérifier si l'utilisateur a accès aux dictées
    if (userQuota.dictations === 0) {
      console.log('🚫 Accès refusé - Plan gratuit');
      return res.status(403).json({
        success: false,
        error: 'Les dictées ne sont pas disponibles avec le plan gratuit',
        type: 'feature_not_available',
        currentPlan: plan,
        upgradeUrl: '/subscription',
        message: 'Passez à un plan payant pour accéder aux dictées audio'
      });
    }

    // Vérifier les quotas (si pas illimité)
    if (userQuota.dictations !== -1) {
      const todayUsage = await prisma.usageLog.count({
        where: {
          userId,
          type: 'dictation',
          createdAt: {
            gte: today
          }
        }
      });

      console.log(`📊 Usage dictées aujourd'hui: ${todayUsage}/${userQuota.dictations}`);

      if (todayUsage >= userQuota.dictations) {
        console.log('🚫 Quota de dictées atteint');
        return res.status(429).json({
          success: false,
          error: 'Quota de dictées atteint',
          quota: userQuota.dictations,
          used: todayUsage,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          upgradeUrl: '/subscription'
        });
      }
    }

    req.userQuota = userQuota;
    console.log('✅ Quota dictée OK, passage au handler');
    next();
  } catch (error) {
    console.error('❌ Erreur checkDictationQuota:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erreur de vérification des quotas',
      details: error.message
    });
  }
};

module.exports = {
  authenticateToken,
  requireSubscription,
  requireAdmin,
  checkQuota,
  checkDictationQuota
};
