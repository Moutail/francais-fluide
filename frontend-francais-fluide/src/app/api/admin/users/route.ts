import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users - Proxy vers backend
export async function GET(request: NextRequest) {
  try {
    const backend =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_BACKEND_URL non configuré' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';
    const url = new URL('/api/admin/users', backend);
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        authorization: authHeader,
      },
    });
    const data = await res
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy récupération utilisateurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy admin users)' },
      { status: 500 }
    );
  }
}
