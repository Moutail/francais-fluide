import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';
const ACCESS_TOKEN_TTL = '15m';

export async function POST(request: NextRequest) {
  try {
    const refreshCookie = request.cookies.get('refresh_token')?.value;
    if (!refreshCookie) {
      return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshCookie, JWT_REFRESH_SECRET) as any;
      if (payload.type !== 'refresh') throw new Error('Type de token invalide');
    } catch (e) {
      return NextResponse.json({ error: 'Refresh token invalide' }, { status: 401 });
    }

    const accessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return NextResponse.json({ success: true, token: accessToken });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

