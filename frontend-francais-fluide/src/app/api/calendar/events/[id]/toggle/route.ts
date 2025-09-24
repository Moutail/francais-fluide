import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// PATCH /api/calendar/events/[id]/toggle - Basculer le statut d'un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const eventId = params.id;

    // Vérifier que l'événement appartient à l'utilisateur
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        userId
      }
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Basculer le statut
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        completed: !event.completed
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent
    });

  } catch (error) {
    console.error('Erreur basculement événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
