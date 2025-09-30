import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  const res = await fetch(backendUrl(`/api/admin/dictations${qs}`), {
    headers: { Authorization: request.headers.get('authorization') || '' }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const res = await fetch(backendUrl('/api/admin/dictations'), {
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
