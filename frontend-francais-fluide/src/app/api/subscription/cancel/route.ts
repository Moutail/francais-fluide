import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/subscription/cancel - Annuler l'abonnement
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    // Récupérer l'abonnement actuel
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Aucun abonnement trouvé' },
        { status: 404 }
      );
    }

    if (subscription.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'L\'abonnement est déjà annulé' },
        { status: 400 }
      );
    }

    // Mettre à jour l'abonnement
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'cancelled',
        endDate: new Date() // Fin immédiate pour la démo
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Abonnement annulé avec succès',
        subscription: updatedSubscription
      }
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
