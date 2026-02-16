import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(backendUrl('/api/dissertation/types'), {
      headers: {
        ...(auth ? { Authorization: auth } : {}),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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
    console.error('Erreur proxy dissertation/types GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy dissertation/types GET)' },
      { status: 500 }
    );
  }
}
