// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Configuration
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    // Note: La vérification de la signature Stripe doit être faite côté backend
    // Ici on fait juste un proxy vers le backend qui gérera la vérification
    
    const response = await fetch(process.env.BACKEND_URL + '/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: body,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erreur webhook Stripe:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Webhook Stripe traité avec succès');
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('❌ Erreur traitement webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Désactiver le body parsing pour les webhooks Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};
