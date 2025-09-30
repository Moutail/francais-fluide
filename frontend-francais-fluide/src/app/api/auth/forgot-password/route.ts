import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_BACKEND_URL non configuré' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${backend}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy forgot-password:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur (proxy forgot-password)' },
      { status: 500 }
    );
  }
}
