import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/stats - Proxy vers le backend (dashboard)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    const res = await fetch(backendUrl('/api/admin/dashboard'), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy admin/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de proxy vers le backend' },
      { status: 502 }
    );
  }
}
