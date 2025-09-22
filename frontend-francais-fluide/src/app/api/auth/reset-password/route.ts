import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token et nouveau mot de passe requis' }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findFirst({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });
      await tx.passwordResetToken.delete({ where: { userId: record.userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

