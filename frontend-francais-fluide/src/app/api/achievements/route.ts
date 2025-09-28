import { NextRequest, NextResponse } from 'next/server';

// GET /api/achievements - proxy vers le backend Express
export async function GET(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_BACKEND_URL non configuré' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';

    const res = await fetch(`${backend}/api/achievements`, {
      method: 'GET',
      headers: {
        'authorization': authHeader,
      },
      // En Next.js (edge/node), on peut passer les cookies si nécessaire
      // credentials: 'include',
    });

    const data = await res.json().catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy achievements)' },
      { status: 500 }
    );
  }
}
