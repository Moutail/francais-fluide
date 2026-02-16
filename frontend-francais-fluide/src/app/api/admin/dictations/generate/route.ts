import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../_utils/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const rawAuth = request.headers.get('authorization') || '';

    const payload = await request.json().catch(() => ({}));
    const res = await fetch(backendUrl('/api/admin/dictations/generate'), {
      method: 'POST',
      headers: {
        ...(rawAuth ? { Authorization: rawAuth } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    return NextResponse.json(data || { success: false, error: text || 'Réponse vide du backend' }, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy admin/dictations/generate POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy admin/dictations/generate POST)' },
      { status: 500 }
    );
  }
}
