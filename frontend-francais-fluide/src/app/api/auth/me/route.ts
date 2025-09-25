// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/me - Proxy vers le backend
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}