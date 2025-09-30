import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../_utils/backend';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/achievements - proxy vers le backend Express
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    const res = await fetch(backendUrl('/api/achievements'), {
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
