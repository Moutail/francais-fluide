import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  const res = await fetch(backendUrl(`/api/admin/dictations${qs}`), {
    headers: { Authorization: request.headers.get('authorization') || '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  try {
    const rawAuth = request.headers.get('authorization') || '';

    const payload = await request.json().catch(() => ({}));
    const res = await fetch(backendUrl('/api/admin/dictations'), {
      method: 'POST',
      headers: {
        ...(rawAuth ? { Authorization: rawAuth } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : { success: false, error: 'Réponse vide du backend' };
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy admin/dictations POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy admin/dictations POST)' },
      { status: 500 }
    );
  }
}
