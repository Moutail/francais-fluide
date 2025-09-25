// src/app/api/subscription/current/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/subscription/current - Proxy vers le backend
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch('http://localhost:3001/api/subscription/current', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy subscription/current:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
