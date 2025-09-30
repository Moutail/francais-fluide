import { NextRequest, NextResponse } from 'next/server';

// POST /api/exercises/submit - Proxy vers backend
export async function POST(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json({ success: false, error: 'NEXT_PUBLIC_BACKEND_URL non configuré' });
    }

    const authHeader = request.headers.get('authorization') || '';
    const body = await request.json().catch(() => ({}));
    const { exerciseId } = body || {};

    // Validation d'entrée
    if (!exerciseId) {
      return NextResponse.json({ success: false, error: 'exerciseId est requis' }, { status: 400 });
    }

    const resp = await fetch(`${backend}/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await resp
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy soumission exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy exercises submit)' },
      { status: 500 }
    );
  }
}
