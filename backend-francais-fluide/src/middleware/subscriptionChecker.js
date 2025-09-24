// src/middleware/subscriptionChecker.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware pour vérifier et mettre à jour le statut des abonnements
const subscriptionChecker = async (req, res, next) => {
  // Ne pas exécuter sur les requêtes de santé
  if (req.path === '/health' || req.path === '/info') {
    return next();
  }

  try {
    // Vérifier tous les abonnements actifs qui ont expiré
    const now = new Date();
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: {
          lt: now
        }
      }
    });

    // Mettre à jour les abonnements expirés
    if (expiredSubscriptions.length > 0) {
      await prisma.subscription.updateMany({
        where: {
          id: {
            in: expiredSubscriptions.map(sub => sub.id)
          }
        },
        data: {
          status: 'expired'
        }
      });

      console.log(`🔄 ${expiredSubscriptions.length} abonnements expirés mis à jour`);
    }

    // Vérifier les abonnements qui vont expirer dans 7 jours
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: sevenDaysFromNow,
          gte: now
        }
      },
      include: {
        user: true
      }
    });

    if (expiringSoon.length > 0) {
      console.log(`⚠️ ${expiringSoon.length} abonnements vont expirer bientôt`);
      // Ici on pourrait envoyer des emails de rappel
    }

  } catch (error) {
    console.error('Erreur vérification abonnements:', error);
    // Ne pas bloquer la requête en cas d'erreur
  }

  next();
};

module.exports = subscriptionChecker;
