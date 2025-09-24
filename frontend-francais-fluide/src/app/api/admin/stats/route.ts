import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/admin/stats - Récupérer les statistiques des abonnements
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Récupérer les statistiques
    const totalUsers = await prisma.user.count();
    
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true
      }
    });

    // Calculer les statistiques par plan
    const byPlan = {
      demo: 0,
      etudiant: 0,
      premium: 0,
      etablissement: 0
    };

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    // Prix des plans (en CAD)
    const planPrices = {
      demo: 0,
      etudiant: 14.99,
      premium: 29.99,
      etablissement: 149.99
    };

    subscriptions.forEach(sub => {
      const plan = sub.plan as keyof typeof byPlan;
      if (byPlan.hasOwnProperty(plan)) {
        byPlan[plan]++;
      }

      if (sub.status === 'active') {
        activeSubscriptions++;
        monthlyRevenue += planPrices[plan as keyof typeof planPrices];
        yearlyRevenue += planPrices[plan as keyof typeof planPrices] * 12;
      } else if (sub.status === 'expired') {
        expiredSubscriptions++;
      }
    });

    // Ajouter les utilisateurs sans abonnement (démo)
    const usersWithoutSubscription = totalUsers - subscriptions.length;
    byPlan.demo += usersWithoutSubscription;

    const stats = {
      total: totalUsers,
      byPlan,
      revenue: {
        monthly: Math.round(monthlyRevenue * 100) / 100,
        yearly: Math.round(yearlyRevenue * 100) / 100
      },
      active: activeSubscriptions,
      expired: expiredSubscriptions
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
