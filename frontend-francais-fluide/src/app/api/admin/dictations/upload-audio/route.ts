// src/app/api/admin/dictations/upload-audio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../../_utils/backend';

// POST /api/admin/dictations/upload-audio - Téléverser un fichier audio
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    
    // Récupérer le FormData (fichier audio)
    const formData = await request.formData();
    
    // Transférer au backend
    const resp = await fetch(backendUrl('/api/admin/dictations/upload-audio'), {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
      body: formData,
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error('Erreur proxy upload audio:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
