// src/app/api/subscription/check-expirations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

// GET /api/subscription/check-expirations - Vérifier les abonnements qui expirent bientôt
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';

    const resp = await fetch(backendUrl('/api/subscription/check-expirations'), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy check-expirations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
