// src/services/subscriptionService.js
const Stripe = require('stripe');

class SubscriptionService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent({ plan, userId, paymentMethodId }) {
    const planPrices = {
      'demo': 0,
      'etudiant': 1499, // 14.99 CAD
      'premium': 2999,  // 29.99 CAD
      'etablissement': 14999 // 149.99 CAD
    };

    const amount = planPrices[plan];
    
    if (amount === 0) {
      // Plan gratuit
      return {
        id: 'free_plan',
        client_secret: null,
        status: 'succeeded'
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount,
      currency: 'cad',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId,
        plan
      }
    });

    return paymentIntent;
  }

  async confirmPayment(paymentIntentId) {
    if (paymentIntentId === 'free_plan') {
      return { status: 'succeeded' };
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'requires_action') {
      // Le paiement nécessite une action supplémentaire
      return paymentIntent;
    }

    return paymentIntent;
  }

  async cancelSubscription(stripeSubscriptionId) {
    if (!stripeSubscriptionId) {
      return;
    }

    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async createSubscription({ customerId, priceId }) {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    return subscription;
  }

  async getCustomer(customerId) {
    return await this.stripe.customers.retrieve(customerId);
  }

  async createCustomer({ email, name }) {
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'francais-fluide'
      }
    });
  }

  async handleWebhook(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Événement non géré: ${event.type}`);
      }
      
      return { received: true };
    } catch (error) {
      console.error('Erreur webhook Stripe:', error);
      throw error;
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    // Mettre à jour l'abonnement en base de données
    console.log('Paiement réussi:', paymentIntent.id);
  }

  async handlePaymentFailed(invoice) {
    // Gérer l'échec de paiement
    console.log('Paiement échoué:', invoice.id);
  }

  async handleSubscriptionDeleted(subscription) {
    // Annuler l'abonnement en base de données
    console.log('Abonnement supprimé:', subscription.id);
  }
}

module.exports = {
  subscriptionService: new SubscriptionService()
};
