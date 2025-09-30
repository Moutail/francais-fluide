// src/app/api/grammar-check/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

// POST /api/grammar-check/check - Proxy vers le backend
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();

    const resp = await fetch(backendUrl('/api/grammar-check/check'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy grammar-check:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
