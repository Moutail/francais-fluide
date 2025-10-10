import { NextRequest, NextResponse } from 'next/server';

// GET /api/dictations - Proxy vers backend
export async function GET(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_API_URL non configuré' },
        { status: 500 }
      );
    }

    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const url = new URL(request.url);
    const query = url.search ? url.search : '';
    const res = await fetch(`${backend}/api/dictations${query}`, {
      method: 'GET',
      headers,
    });
    const data = await res
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy récupération dictées:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy dictations GET)' },
      { status: 500 }
    );
  }
}

// POST /api/dictations - Proxy vers backend
export async function POST(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_API_URL non configuré' },
        { status: 500 }
      );
    }

    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${backend}/api/dictations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy création dictée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy dictations POST)' },
      { status: 500 }
    );
  }
}
