// src/middleware/premiumAccess.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware pour vérifier l'accès aux fonctionnalités premium
const requirePremiumAccess = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
        type: 'auth_required'
      });
    }

    // Récupérer l'abonnement de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        type: 'user_not_found'
      });
    }

    const subscription = user.subscription;

    // Vérifier qu'il y a un abonnement
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Aucun abonnement trouvé. Un abonnement Premium ou Établissement est requis pour cette fonctionnalité.',
        type: 'no_subscription',
        upgradeUrl: '/subscription'
      });
    }

    // Vérifier que l'abonnement est actif
    if (subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Abonnement inactif. Veuillez renouveler votre abonnement.',
        type: 'inactive_subscription',
        status: subscription.status,
        upgradeUrl: '/subscription'
      });
    }

    // Vérifier que l'abonnement n'a pas expiré
    if (new Date() > new Date(subscription.endDate)) {
      // Mettre à jour le statut
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });

      return res.status(403).json({
        success: false,
        error: 'Abonnement expiré. Veuillez renouveler votre abonnement.',
        type: 'expired_subscription',
        expiredAt: subscription.endDate,
        upgradeUrl: '/subscription'
      });
    }

    // Vérifier que le plan donne accès aux fonctionnalités premium
    const premiumPlans = ['premium', 'etablissement'];
    if (!premiumPlans.includes(subscription.plan)) {
      return res.status(403).json({
        success: false,
        error: `Abonnement ${subscription.plan} insuffisant. Un abonnement Premium ou Établissement est requis.`,
        type: 'insufficient_plan',
        currentPlan: subscription.plan,
        requiredPlans: premiumPlans,
        upgradeUrl: '/subscription'
      });
    }

    // Ajouter les informations d'abonnement à la requête
    req.user.subscription = subscription;
    req.user.plan = subscription.plan;
    
    next();

  } catch (error) {
    console.error('Erreur vérification accès premium:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de vérification d\'abonnement',
      type: 'verification_error'
    });
  }
};

// Middleware pour vérifier l'accès aux fonctionnalités établissement
const requireInstitutionAccess = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    const subscription = user?.subscription;

    if (!subscription || subscription.status !== 'active' || subscription.plan !== 'etablissement') {
      return res.status(403).json({
        success: false,
        error: 'Abonnement Établissement requis pour cette fonctionnalité',
        type: 'institution_required',
        upgradeUrl: '/subscription'
      });
    }

    req.user.subscription = subscription;
    next();

  } catch (error) {
    console.error('Erreur vérification accès établissement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de vérification d\'abonnement'
    });
  }
};

// Fonction utilitaire pour vérifier un plan spécifique
const checkSubscriptionPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      });

      const subscription = user?.subscription;

      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Abonnement actif requis',
          type: 'subscription_required',
          upgradeUrl: '/subscription'
        });
      }

      if (!requiredPlans.includes(subscription.plan)) {
        return res.status(403).json({
          success: false,
          error: `Plan insuffisant. Plans requis: ${requiredPlans.join(', ')}`,
          type: 'insufficient_plan',
          currentPlan: subscription.plan,
          requiredPlans,
          upgradeUrl: '/subscription'
        });
      }

      req.user.subscription = subscription;
      req.user.plan = subscription.plan;
      next();

    } catch (error) {
      console.error('Erreur vérification plan:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur de vérification d\'abonnement'
      });
    }
  };
};

// Fonction pour obtenir les limites selon le plan
const getSubscriptionLimits = (plan) => {
  const limits = {
    demo: {
      corrections: 10,
      exercises: 5,
      aiChat: 5,
      dissertationAssistant: 0, // Pas d'accès
      advancedFeatures: false
    },
    etudiant: {
      corrections: 100,
      exercises: 50,
      aiChat: 100,
      dissertationAssistant: 10, // 10 par jour
      advancedFeatures: false
    },
    premium: {
      corrections: -1, // Illimité
      exercises: -1,
      aiChat: -1,
      dissertationAssistant: -1, // Illimité
      advancedFeatures: true
    },
    etablissement: {
      corrections: -1,
      exercises: -1,
      aiChat: -1,
      dissertationAssistant: -1,
      advancedFeatures: true,
      multiUser: true,
      analytics: true
    }
  };

  return limits[plan] || limits.demo;
};

// Middleware pour vérifier les quotas d'usage
const checkUsageQuota = (featureType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const plan = req.user?.plan || 'demo';
      
      const limits = getSubscriptionLimits(plan);
      const featureLimit = limits[featureType];

      // Si illimité, passer
      if (featureLimit === -1) {
        return next();
      }

      // Si pas d'accès du tout
      if (featureLimit === 0) {
        return res.status(403).json({
          success: false,
          error: `Fonctionnalité non disponible avec votre plan ${plan}`,
          type: 'feature_not_available',
          upgradeUrl: '/subscription'
        });
      }

      // Vérifier l'usage quotidien
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsage = await prisma.usageLog.count({
        where: {
          userId,
          type: featureType,
          createdAt: {
            gte: today
          }
        }
      });

      if (todayUsage >= featureLimit) {
        return res.status(429).json({
          success: false,
          error: `Quota quotidien atteint pour cette fonctionnalité (${featureLimit}/${featureLimit})`,
          type: 'quota_exceeded',
          quota: featureLimit,
          used: todayUsage,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          upgradeUrl: '/subscription'
        });
      }

      // Ajouter les informations de quota à la requête
      req.user.quota = {
        limit: featureLimit,
        used: todayUsage,
        remaining: featureLimit - todayUsage
      };

      next();

    } catch (error) {
      console.error('Erreur vérification quota:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur de vérification de quota'
      });
    }
  };
};

module.exports = {
  requirePremiumAccess,
  requireInstitutionAccess,
  checkSubscriptionPlan,
  getSubscriptionLimits,
  checkUsageQuota
};
