// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/auth/me - Proxy vers le backend
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch(backendUrl('/api/auth/me'), {
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
