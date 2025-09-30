import { NextRequest, NextResponse } from 'next/server';

// POST /api/dictations/submit - Proxy vers backend
export async function POST(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_BACKEND_URL non configuré' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${backend}/api/dictations/submit`, {
      method: 'POST',
      headers: {
        authorization: authHeader,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy soumission dictée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy dictations submit)' },
      { status: 500 }
    );
  }
}
