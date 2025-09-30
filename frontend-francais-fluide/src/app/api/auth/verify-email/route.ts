import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_BACKEND_URL non configuré' }, { status: 500 });
    }

    const url = new URL(request.url);
    const query = url.search ? url.search : '';
    const res = await fetch(`${backend}/api/auth/verify-email${query}`, {
      method: 'GET',
    });
    const data = await res.json().catch(() => ({ error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy verify-email:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur (proxy verify-email)' },
      { status: 500 }
    );
  }
}
