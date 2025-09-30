import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '../../_utils/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, category, priority, description } = body;

    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    // Envoyer la demande au backend
    const response = await fetch(backendUrl('/api/support/contact'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        subject,
        category,
        priority,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Erreur lors de l'envoi de la demande" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API support contact:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
