import { NextRequest, NextResponse } from 'next/server';
const BACKEND_BASE = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const res = await fetch(`${BACKEND_BASE}/api/admin/dictations/bulk-action`, {
    method: 'POST',
    headers: {
      Authorization: request.headers.get('authorization') || '',
      'Content-Type': 'application/json'
    },
    body
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
