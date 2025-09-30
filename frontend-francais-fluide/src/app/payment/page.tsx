// src/app/payment/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Lock, Check, ArrowLeft, Shield, Clock, Crown } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription/plans';
import { formatPrice } from '@/lib/config/pricing';

interface PaymentFormData {
  email: string;
  name: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  city: string;
  postalCode: string;
  province: string;
  saveCard: boolean;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'premium';
  const billingInterval = searchParams.get('interval') || 'month';

  const [formData, setFormData] = useState<PaymentFormData>({
    email: '',
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    postalCode: '',
    province: '',
    saveCard: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  const price = selectedPlan?.price || 0;
  const finalPrice = billingInterval === 'year' ? price * 12 * 0.8 : price; // 20% de réduction annuelle

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.email) newErrors.email = 'Email requis';
    if (!formData.name) newErrors.name = 'Nom requis';
    if (!formData.cardNumber || formData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Numéro de carte invalide';
    }
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Date d'expiration invalide (MM/AA)";
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV invalide';
    }
    if (!formData.billingAddress) newErrors.billingAddress = 'Adresse requise';
    if (!formData.city) newErrors.city = 'Ville requise';
    if (!formData.postalCode) newErrors.postalCode = 'Code postal requis';
    if (!formData.province) newErrors.province = 'Province requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulation du paiement Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirection vers la page de succès
      window.location.href = `/payment/success?plan=${planId}&amount=${finalPrice}`;
    } catch (error) {
      console.error('Erreur de paiement:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
  };

  if (!selectedPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Plan non trouvé</h1>
          <a href="/subscription" className="text-blue-600 hover:underline">
            Retour aux abonnements
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/subscription"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Paiement sécurisé</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Paiement sécurisé SSL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulaire de paiement */}
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Informations de paiement</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Nom complet */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jean Dupont"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Carte de crédit */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Numéro de carte
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={e =>
                      handleInputChange('cardNumber', formatCardNumber(e.target.value))
                    }
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              {/* Date d'expiration et CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={e =>
                      handleInputChange('expiryDate', formatExpiryDate(e.target.value))
                    }
                    className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={e => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>}
                </div>
              </div>

              {/* Adresse de facturation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Adresse de facturation
                </label>
                <input
                  type="text"
                  value={formData.billingAddress}
                  onChange={e => handleInputChange('billingAddress', e.target.value)}
                  className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                    errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Rue de la Paix"
                />
                {errors.billingAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.billingAddress}</p>
                )}
              </div>

              {/* Ville, Code postal, Province */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Montréal"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={e => handleInputChange('postalCode', e.target.value.toUpperCase())}
                    className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="H1A 1A1"
                    maxLength={7}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Province</label>
                  <select
                    value={formData.province}
                    onChange={e => handleInputChange('province', e.target.value)}
                    className={`w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.province ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner</option>
                    <option value="QC">Québec</option>
                    <option value="ON">Ontario</option>
                    <option value="BC">Colombie-Britannique</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nouvelle-Écosse</option>
                    <option value="NB">Nouveau-Brunswick</option>
                    <option value="NL">Terre-Neuve-et-Labrador</option>
                    <option value="PE">Île-du-Prince-Édouard</option>
                    <option value="YT">Yukon</option>
                    <option value="NT">Territoires du Nord-Ouest</option>
                    <option value="NU">Nunavut</option>
                  </select>
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                  )}
                </div>
              </div>

              {/* Sauvegarder la carte */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={formData.saveCard}
                  onChange={e => handleInputChange('saveCard', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="saveCard" className="text-sm text-gray-700">
                  Sauvegarder cette carte pour les futurs paiements
                </label>
              </div>

              {/* Bouton de paiement */}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Payer {formatPrice(finalPrice)} CAD
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Résumé de la commande */}
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Résumé de votre commande</h3>

            <div className="space-y-4">
              {/* Plan sélectionné */}
              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatPrice(finalPrice)} CAD</div>
                  <div className="text-sm text-gray-600">
                    /{billingInterval === 'month' ? 'mois' : 'an'}
                  </div>
                </div>
              </div>

              {/* Détails de facturation */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{formatPrice(price)} CAD</span>
                </div>
                {billingInterval === 'year' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Réduction annuelle (20%)</span>
                    <span className="text-green-600">-{formatPrice(price * 12 * 0.2)} CAD</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TPS (5%)</span>
                  <span className="text-gray-900">{formatPrice(finalPrice * 0.05)} CAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVQ (9.975%)</span>
                  <span className="text-gray-900">{formatPrice(finalPrice * 0.09975)} CAD</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalPrice * 1.14975)} CAD</span>
                </div>
              </div>

              {/* Garanties */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Annulation à tout moment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Accès immédiat après paiement</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Support client 24/7</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Paiement sécurisé SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
