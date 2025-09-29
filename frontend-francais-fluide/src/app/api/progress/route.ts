// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../_utils/backend';

// GET /api/progress - Proxy vers le backend
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch(backendUrl('/api/progress'), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy progression:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/progress - Proxy vers le backend
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();
    
    const resp = await fetch(backendUrl('/api/progress'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy mise à jour progression:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}