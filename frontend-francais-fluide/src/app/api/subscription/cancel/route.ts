// src/app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';

// POST /api/subscription/cancel - Proxy vers le backend
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch('http://localhost:3001/api/subscription/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy subscription/cancel:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}