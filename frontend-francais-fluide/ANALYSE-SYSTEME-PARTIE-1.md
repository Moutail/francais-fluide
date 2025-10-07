# 📊 Analyse Système - Partie 1 : Abonnements

Date : 7 octobre 2025

---

## 🎯 1. Système d'Abonnement - Analyse Détaillée

### ✅ Ce qui fonctionne BIEN

#### Plans disponibles (4 niveaux)
```
📦 Démo Gratuite - 0 CAD/mois
   • 5 corrections IA/jour
   • 3 exercices/jour
   • 0 dictée/jour
   • Support communautaire

🎓 Étudiant - 14.99 CAD/mois
   • Corrections IA illimitées
   • 20 exercices/jour
   • 10 dictées/jour
   • Tuteur IA intelligent
   • Analytics avancées
   • Support prioritaire

👑 Premium - 29.99 CAD/mois
   • Tout illimité
   • Exercices personnalisés
   • Mode hors ligne
   • Assistant IA avancé
   • API complète

🏢 Établissement - 149.99 CAD/mois
   • Tout Premium
   • Multi-utilisateurs
   • Tableau de bord admin
   • Support dédié
   • Formation personnalisée
```

#### Contrôle d'accès granulaire
✅ Fichier : `src/lib/subscription/accessControl.ts`
- Vérification par fonctionnalité
- Quotas journaliers configurables
- Messages d'upgrade personnalisés
- Protection des routes premium

---

## ❌ PROBLÈMES CRITIQUES Identifiés

### 🔴 Problème #1 : Pas de vérification d'expiration automatique

**Fichier problématique :** `src/lib/subscription/subscriptionService.ts` (ligne 70-79)

```typescript
// ❌ CODE ACTUEL - INCOMPLET
static isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  
  return endDate > now; // Vérifie seulement la date
}
```

**Problèmes :**
1. ❌ Pas de désactivation automatique après expiration
2. ❌ Pas de notification avant expiration
3. ❌ Pas de période de grâce
4. ❌ Pas de gestion des abonnements "expired"

**Impact utilisateur :**
- Un utilisateur peut continuer à utiliser les fonctionnalités premium après expiration
- Pas d'alerte avant la fin de l'abonnement
- Confusion sur le statut de l'abonnement

---

### 🔴 Problème #2 : Pas de système de renouvellement automatique

**Manquant complètement :**
- ❌ Webhook Stripe pour renouvellement
- ❌ Gestion des échecs de paiement
- ❌ Notifications d'expiration (J-7, J-3, J-1)
- ❌ Historique des paiements
- ❌ Facturation automatique

**Impact business :**
- Perte de revenus récurrents
- Taux de churn élevé
- Mauvaise expérience utilisateur

---

### 🔴 Problème #3 : Limites simulées, pas réelles

**Fichier problématique :** `src/lib/subscription/limits.ts` (ligne 136-141)

```typescript
// ❌ CODE ACTUEL - VALEURS CODÉES EN DUR
export function useSubscriptionLimits(userPlan: string = 'free') {
  const usage: UsageStats = {
    aiCorrections: 2,        // ❌ Valeur fixe
    exercisesCompleted: 1,   // ❌ Valeur fixe
    lastResetDate: new Date().toISOString(),
    planId: userPlan,
  };
  // ...
}
```

**Problèmes :**
1. ❌ Les limites ne sont pas vraiment appliquées
2. ❌ Pas de comptage réel des utilisations
3. ❌ Pas de reset automatique à minuit
4. ❌ Pas de synchronisation avec le backend

**Impact :**
- Les utilisateurs gratuits peuvent utiliser les fonctionnalités premium
- Pas de monétisation efficace
- Abus possibles du système

---

## 🔧 SOLUTIONS RECOMMANDÉES

### Solution #1 : Gestionnaire d'expiration complet

**Nouveau fichier à créer :** `src/lib/subscription/expiration-manager.ts`

```typescript
export interface ExpirationStatus {
  isExpired: boolean;
  daysRemaining: number;
  shouldNotify: boolean;
  notificationLevel: 'none' | 'info' | 'warning' | 'critical';
}

export class SubscriptionExpirationManager {
  /**
   * Vérifie le statut d'expiration d'un abonnement
   */
  static checkExpiration(subscription: UserSubscription): ExpirationStatus {
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const msRemaining = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    
    let notificationLevel: ExpirationStatus['notificationLevel'] = 'none';
    if (daysRemaining <= 1) notificationLevel = 'critical';
    else if (daysRemaining <= 3) notificationLevel = 'warning';
    else if (daysRemaining <= 7) notificationLevel = 'info';
    
    return {
      isExpired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      shouldNotify: daysRemaining <= 7 && daysRemaining > 0,
      notificationLevel,
    };
  }

  /**
   * Désactive automatiquement un abonnement expiré
   */
  static async handleExpiredSubscription(userId: string): Promise<void> {
    try {
      // 1. Mettre à jour le statut à 'expired'
      await fetch('/api/subscription/expire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      // 2. Révoquer l'accès aux fonctionnalités premium
      await this.revokePremiumAccess(userId);

      // 3. Envoyer une notification
      await this.sendExpirationNotification(userId);

      // 4. Proposer le renouvellement
      await this.offerRenewal(userId);
    } catch (error) {
      console.error('Erreur gestion expiration:', error);
    }
  }

  /**
   * Envoie des rappels avant expiration
   */
  static async sendExpirationReminders(): Promise<void> {
    // À appeler via un cron job quotidien
    const response = await fetch('/api/subscription/check-expirations');
    const { expiringSoon } = await response.json();

    for (const sub of expiringSoon) {
      const status = this.checkExpiration(sub);
      
      if (status.shouldNotify) {
        await this.sendReminderEmail(sub.userId, status.daysRemaining);
      }
    }
  }

  /**
   * Période de grâce après expiration
   */
  static isInGracePeriod(subscription: UserSubscription): boolean {
    const status = this.checkExpiration(subscription);
    const daysExpired = Math.abs(status.daysRemaining);
    
    // 3 jours de grâce après expiration
    return status.isExpired && daysExpired <= 3;
  }

  private static async revokePremiumAccess(userId: string): Promise<void> {
    // Révoquer l'accès aux fonctionnalités premium
    await fetch(`/api/users/${userId}/revoke-premium`, {
      method: 'POST',
    });
  }

  private static async sendExpirationNotification(userId: string): Promise<void> {
    // Envoyer email + notification in-app
    await fetch('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        type: 'subscription_expired',
        message: 'Votre abonnement a expiré. Renouvelez maintenant pour continuer.',
      }),
    });
  }

  private static async offerRenewal(userId: string): Promise<void> {
    // Rediriger vers la page de renouvellement
    await fetch('/api/subscription/renewal-offer', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  private static async sendReminderEmail(
    userId: string, 
    daysRemaining: number
  ): Promise<void> {
    await fetch('/api/emails/send', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        template: 'expiration_reminder',
        data: { daysRemaining },
      }),
    });
  }
}
```

**Utilisation :**

```typescript
// Dans un middleware ou hook
const subscription = await getSubscription(userId);
const status = SubscriptionExpirationManager.checkExpiration(subscription);

if (status.isExpired && !SubscriptionExpirationManager.isInGracePeriod(subscription)) {
  await SubscriptionExpirationManager.handleExpiredSubscription(userId);
  return redirect('/subscription/expired');
}

if (status.shouldNotify) {
  showNotification({
    level: status.notificationLevel,
    message: `Votre abonnement expire dans ${status.daysRemaining} jour(s)`,
  });
}
```

---

### Solution #2 : Système de renouvellement automatique

**Nouveau fichier à créer :** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Gérer les différents événements
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleFailedPayment(event.data.object as Stripe.Invoice);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.trial_will_end':
      await handleTrialEnding(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // 1. Récupérer l'utilisateur
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  // 2. Prolonger l'abonnement
  const newEndDate = new Date();
  newEndDate.setMonth(newEndDate.getMonth() + 1);

  await fetch(backendUrl('/api/subscription/renew'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      endDate: newEndDate.toISOString(),
      status: 'active',
      paymentId: invoice.id,
      amount: invoice.amount_paid / 100,
    }),
  });

  // 3. Envoyer confirmation
  await sendRenewalConfirmation(user.id, invoice);

  console.log(`✅ Renouvellement réussi pour ${user.email}`);
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  // 1. Marquer l'abonnement comme "payment_failed"
  await fetch(backendUrl('/api/subscription/payment-failed'), {
    method: 'POST',
    body: JSON.stringify({ userId: user.id }),
  });

  // 2. Envoyer notification d'échec
  await sendPaymentFailedNotification(user.id, invoice);

  // 3. Donner 3 jours de grâce
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

  await fetch(backendUrl('/api/subscription/grace-period'), {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      gracePeriodEnd: gracePeriodEnd.toISOString(),
    }),
  });

  console.log(`❌ Échec paiement pour ${user.email}`);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  // 1. Mettre à jour le statut
  await fetch(backendUrl('/api/subscription/cancel'), {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      cancelledAt: new Date().toISOString(),
    }),
  });

  // 2. Envoyer confirmation d'annulation
  await sendCancellationConfirmation(user.id);

  console.log(`🔴 Abonnement annulé pour ${user.email}`);
}
```

---

### Solution #3 : Comptage réel des limites

**Fichier à modifier :** `src/lib/subscription/limits.ts`

```typescript
export class SubscriptionLimiter {
  /**
   * Récupère l'usage réel depuis le backend
   */
  static async getRealUsage(userId: string): Promise<UsageStats> {
    try {
      const response = await fetch(`/api/usage/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur récupération usage');
      }

      const data = await response.json();
      return data.usage;
    } catch (error) {
      console.error('Erreur getRealUsage:', error);
      // Fallback sur valeurs par défaut
      return {
        aiCorrections: 0,
        exercisesCompleted: 0,
        lastResetDate: new Date().toISOString(),
        planId: 'demo',
      };
    }
  }

  /**
   * Incrémente l'usage côté backend
   */
  static async incrementUsage(
    userId: string,
    feature: 'aiCorrections' | 'exercisesCompleted' | 'dictationsCompleted'
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/usage/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, feature }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur incrementUsage:', error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut utiliser une fonctionnalité
   */
  static async canUseFeature(
    userId: string,
    feature: 'aiCorrections' | 'exercisesCompleted' | 'dictationsCompleted'
  ): Promise<{ allowed: boolean; remaining: number; message?: string }> {
    const usage = await this.getRealUsage(userId);
    const limiter = new SubscriptionLimiter(usage);

    if (feature === 'aiCorrections') {
      return limiter.checkAICorrections();
    } else if (feature === 'exercisesCompleted') {
      return limiter.checkExercises();
    }

    return { allowed: false, remaining: 0, message: 'Fonctionnalité inconnue' };
  }
}
```

**API Backend à créer :** `backend/src/routes/usage.ts`

```typescript
// GET /api/usage/:userId
router.get('/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  
  // Récupérer depuis la DB
  const usage = await db.usage.findOne({ userId });
  
  // Vérifier si reset nécessaire (nouveau jour)
  const lastReset = new Date(usage.lastResetDate);
  const now = new Date();
  
  if (lastReset.getDate() !== now.getDate()) {
    // Reset quotidien
    usage.aiCorrections = 0;
    usage.exercisesCompleted = 0;
    usage.dictationsCompleted = 0;
    usage.lastResetDate = now.toISOString();
    await usage.save();
  }
  
  res.json({ success: true, usage });
});

// POST /api/usage/increment
router.post('/increment', authenticate, async (req, res) => {
  const { userId, feature } = req.body;
  
  const usage = await db.usage.findOne({ userId });
  usage[feature]++;
  await usage.save();
  
  res.json({ success: true, usage });
});
```

---

## ✅ RÉSUMÉ DES ACTIONS À FAIRE

### Priorité CRITIQUE (À faire immédiatement)

1. ✅ Créer `expiration-manager.ts`
2. ✅ Créer webhook Stripe `/api/webhooks/stripe/route.ts`
3. ✅ Modifier `limits.ts` pour usage réel
4. ✅ Créer API backend `/api/usage`
5. ✅ Ajouter cron job pour vérifier expirations quotidiennes

### Temps estimé : 2-3 jours de développement

---

**Prochaine partie : Système de Dictées**
