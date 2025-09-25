// src/app/api/ai-enhanced/analyze-progress/route.ts
import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai-enhanced/analyze-progress - Proxy vers le backend
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';
    const body = await request.json();
    
    const resp = await fetch('http://localhost:3001/api/ai-enhanced/analyze-progress', {
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
    console.error('Erreur proxy ai-enhanced/analyze-progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
