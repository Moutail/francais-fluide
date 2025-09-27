import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const qs = request.nextUrl.search;
  const res = await fetch(`${BACKEND_BASE}/api/admin/support${qs}`, {
    headers: { Authorization: authHeader }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
