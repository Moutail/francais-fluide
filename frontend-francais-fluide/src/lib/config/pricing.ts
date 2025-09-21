// src/lib/config/pricing.ts

export interface PricingConfig {
  currency: 'CAD' | 'USD' | 'EUR';
  locale: string;
  taxRate: number; // TPS/TVH au Canada
  discounts: {
    annual: number; // Réduction annuelle en %
    student: number; // Réduction étudiant en %
    enterprise: number; // Réduction entreprise en %
  };
}

export const PRICING_CONFIG: PricingConfig = {
  currency: 'CAD',
  locale: 'fr-CA',
  taxRate: 0.13, // 13% (TPS 5% + TVH 8-10% selon province)
  discounts: {
    annual: 20, // 20% de réduction pour paiement annuel
    student: 15, // 15% de réduction pour étudiants
    enterprise: 25 // 25% de réduction pour établissements
  }
};

export const formatPrice = (price: number, currency: string = 'CAD'): string => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
};

export const calculateTax = (price: number): number => {
  return price * PRICING_CONFIG.taxRate;
};

export const calculateAnnualPrice = (monthlyPrice: number): number => {
  const annualPrice = monthlyPrice * 12;
  const discount = annualPrice * (PRICING_CONFIG.discounts.annual / 100);
  return annualPrice - discount;
};

export const getProvincialTaxRate = (province: string): number => {
  const taxRates: Record<string, number> = {
    'QC': 0.14975, // Québec (GST 5% + QST 9.975%)
    'ON': 0.13,    // Ontario (HST 13%)
    'BC': 0.12,    // Colombie-Britannique (GST 5% + PST 7%)
    'AB': 0.05,    // Alberta (GST 5% seulement)
    'SK': 0.11,    // Saskatchewan (GST 5% + PST 6%)
    'MB': 0.12,    // Manitoba (GST 5% + RST 7%)
    'NS': 0.15,    // Nouvelle-Écosse (HST 15%)
    'NB': 0.15,    // Nouveau-Brunswick (HST 15%)
    'NL': 0.15,    // Terre-Neuve-et-Labrador (HST 15%)
    'PE': 0.15,    // Île-du-Prince-Édouard (HST 15%)
    'YT': 0.05,    // Yukon (GST 5% seulement)
    'NT': 0.05,    // Territoires du Nord-Ouest (GST 5% seulement)
    'NU': 0.05,    // Nunavut (GST 5% seulement)
  };
  
  return taxRates[province] || PRICING_CONFIG.taxRate;
};

// Projections de revenus en CAD
export const REVENUE_PROJECTIONS = {
  monthly: {
    student: 149900, // 10,000 abonnés × 14.99$
    premium: 299900, // 10,000 abonnés × 29.99$
    enterprise: 1499900, // 100 clients × 149.99$
    total: 1949700 // ~1.95M$ CAD/mois
  },
  annual: {
    student: 1798800, // 10,000 × 14.99$ × 12 mois
    premium: 3598800, // 10,000 × 29.99$ × 12 mois
    enterprise: 17998800, // 100 × 149.99$ × 12 mois
    total: 23396400 // ~23.4M$ CAD/an
  }
};
