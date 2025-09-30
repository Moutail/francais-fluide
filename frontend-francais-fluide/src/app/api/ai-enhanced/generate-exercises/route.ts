// src/app/api/ai-enhanced/generate-exercises/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

// POST /api/ai-enhanced/generate-exercises - Proxy vers le backend
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();

    const resp = await fetch(backendUrl('/api/ai-enhanced/generate-exercises'), {
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
    console.error('Erreur proxy ai-enhanced/generate-exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
