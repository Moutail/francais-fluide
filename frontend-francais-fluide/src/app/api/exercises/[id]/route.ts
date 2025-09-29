import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

// GET /api/exercises/[id] - Proxy vers backend
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch(backendUrl(`/api/exercises/${params.id}`), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      cache: 'no-store',
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur récupération exercice (proxy):', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Proxy vers backend
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();
    const resp = await fetch(backendUrl(`/api/exercises/${params.id}`), {
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
    console.error('Erreur mise à jour exercice (proxy):', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Proxy vers backend
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization') || '';
    const resp = await fetch(backendUrl(`/api/exercises/${params.id}`), {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur suppression exercice (proxy):', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
