import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/exercises/submit - Soumettre une réponse d'exercice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseId, answers, timeSpent } = body;

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

    // Proxy vers backend pour gérer la soumission (évite Prisma côté frontend)
    const resp = await fetch(`http://localhost:3001/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ exerciseId, answers, timeSpent })
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Erreur lors de la soumission' },
        { status: resp.status || 500 }
      );
    }

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('Erreur soumission exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
