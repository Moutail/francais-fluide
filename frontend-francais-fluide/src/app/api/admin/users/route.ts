import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/admin/users - Récupérer tous les utilisateurs avec leurs abonnements
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
    const userId = decoded.userId;

    // Vérifier que l'utilisateur est admin (pour l'instant, on accepte tous les utilisateurs)
    // TODO: Ajouter une vérification de rôle admin

    // Récupérer tous les utilisateurs avec leurs abonnements et progression
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        progress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formater les données pour l'interface admin
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate
      } : {
        plan: 'demo',
        status: 'active',
        startDate: user.createdAt,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
      },
      progress: user.progress ? {
        level: user.progress.level,
        xp: user.progress.xp,
        exercisesCompleted: user.progress.exercisesCompleted,
        wordsWritten: user.progress.wordsWritten
      } : {
        level: 1,
        xp: 0,
        exercisesCompleted: 0,
        wordsWritten: 0
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
