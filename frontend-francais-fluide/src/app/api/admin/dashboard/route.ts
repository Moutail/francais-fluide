import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

// GET /api/admin/dashboard - Proxy vers le backend
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    const res = await fetch(`${BACKEND_BASE}/api/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy admin/dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de proxy vers le backend' },
      { status: 502 }
    );
  }
}