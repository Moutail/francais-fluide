import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 });
    }

    const record = await prisma.emailVerificationToken.findFirst({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
      await tx.emailVerificationToken.delete({ where: { userId: record.userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur verify-email:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

