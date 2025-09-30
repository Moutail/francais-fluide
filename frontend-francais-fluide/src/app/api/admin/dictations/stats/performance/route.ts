import { NextRequest, NextResponse } from 'next/server';
const BACKEND_BASE =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  const res = await fetch(`${BACKEND_BASE}/api/admin/dictations/stats/performance${qs}`, {
    headers: { Authorization: request.headers.get('authorization') || '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
