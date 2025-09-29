import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../_utils/backend';

// Proxy vers le backend (port 3001) pour éviter d'utiliser le client Prisma côté frontend

// GET /api/exercises - Récupérer tous les exercices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const token = request.headers.get('authorization') || '';

    const resp = await fetch(backendUrl(`/api/exercises${query ? `?${query}` : ''}`), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy exercices:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Créer un nouvel exercice
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();
    const resp = await fetch(backendUrl('/api/exercises'), {
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
    console.error('Erreur proxy création exercice:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}