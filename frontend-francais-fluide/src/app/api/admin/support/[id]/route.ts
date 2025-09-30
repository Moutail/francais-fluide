import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const res = await fetch(`${BACKEND_BASE}/api/admin/support/${id}`, {
    headers: { Authorization: _req.headers.get('authorization') || '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.text();
  const res = await fetch(`${BACKEND_BASE}/api/admin/support/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: request.headers.get('authorization') || '',
      'Content-Type': 'application/json',
    },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const res = await fetch(`${BACKEND_BASE}/api/admin/support/${id}`, {
    method: 'DELETE',
    headers: { Authorization: request.headers.get('authorization') || '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
