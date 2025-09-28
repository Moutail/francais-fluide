// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BACKEND_URL non configuré' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${backend}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Forward JSON response and status
    const data = await res.json().catch(() => ({ error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy auth login:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur (proxy auth login)' },
      { status: 500 }
    );
  }
}
