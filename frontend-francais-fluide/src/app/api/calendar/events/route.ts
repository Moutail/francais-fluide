import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/calendar/events - Récupérer les événements du calendrier
export async function GET(request: NextRequest) {
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

    // Récupérer les événements du calendrier
    const events = await prisma.calendarEvent.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Erreur récupération événements calendrier:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
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

    const { title, type, date, time, description, points } = await request.json();

    // Créer l'événement
    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        type,
        date: new Date(date),
        time: time || null,
        description: description || null,
        points: points || 0,
        completed: false
      }
    });

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Erreur création événement calendrier:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
