import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/calendar/events/[id] - Proxy vers le backend Express
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_BACKEND_URL non configuré' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';

    const res = await fetch(`${backend}/api/calendar/events/${params.id}`, {
      method: 'DELETE',
      headers: {
        authorization: authHeader,
      },
    });

    const data = await res
      .json()
      .catch(() => ({ success: false, error: 'Réponse invalide du backend' }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Erreur proxy suppression événement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur (proxy calendar delete)' },
      { status: 500 }
    );
  }
}
