// src/components/subscription/TaxInfo.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, MapPin } from 'lucide-react';
import { formatPrice, getProvincialTaxRate } from '@/lib/config/pricing';
import { cn } from '@/lib/utils/cn';

interface TaxInfoProps {
  price: number;
  province?: string;
  className?: string;
}

export const TaxInfo: React.FC<TaxInfoProps> = ({ price, province = 'ON', className }) => {
  const taxRate = getProvincialTaxRate(province);
  const taxAmount = price * taxRate;
  const totalPrice = price + taxAmount;

  const provinces = {
    QC: 'Québec',
    ON: 'Ontario',
    BC: 'Colombie-Britannique',
    AB: 'Alberta',
    SK: 'Saskatchewan',
    MB: 'Manitoba',
    NS: 'Nouvelle-Écosse',
    NB: 'Nouveau-Brunswick',
    NL: 'Terre-Neuve-et-Labrador',
    PE: 'Île-du-Prince-Édouard',
    YT: 'Yukon',
    NT: 'Territoires du Nord-Ouest',
    NU: 'Nunavut',
  };

  const getTaxBreakdown = () => {
    if (province === 'QC') {
      return {
        gst: price * 0.05,
        qst: price * 0.09975,
        total: taxAmount,
      };
    } else if (['ON', 'NS', 'NB', 'NL', 'PE'].includes(province)) {
      return {
        hst: taxAmount,
        total: taxAmount,
      };
    } else {
      return {
        gst: price * 0.05,
        pst: taxAmount - price * 0.05,
        total: taxAmount,
      };
    }
  };

  const breakdown = getTaxBreakdown();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg border border-blue-200 bg-blue-50 p-4', className)}
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
        <div className="flex-1">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
            <MapPin className="size-4" />
            Taxes applicables - {provinces[province as keyof typeof provinces]}
          </h4>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Prix avant taxes :</span>
              <span className="font-medium">{formatPrice(price)}</span>
            </div>

            {breakdown.gst && (
              <div className="flex justify-between">
                <span className="text-blue-800">TPS (5%) :</span>
                <span className="font-medium">{formatPrice(breakdown.gst)}</span>
              </div>
            )}

            {breakdown.qst && (
              <div className="flex justify-between">
                <span className="text-blue-800">TVQ (9.975%) :</span>
                <span className="font-medium">{formatPrice(breakdown.qst)}</span>
              </div>
            )}

            {breakdown.hst && (
              <div className="flex justify-between">
                <span className="text-blue-800">TPS/TVH ({(taxRate * 100).toFixed(1)}%) :</span>
                <span className="font-medium">{formatPrice(breakdown.hst)}</span>
              </div>
            )}

            {breakdown.pst && breakdown.pst > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-800">
                  TVP ({((breakdown.pst / price) * 100).toFixed(1)}%) :
                </span>
                <span className="font-medium">{formatPrice(breakdown.pst)}</span>
              </div>
            )}

            <div className="mt-2 border-t border-blue-300 pt-1">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Total avec taxes :</span>
                <span className="font-bold text-blue-900">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-blue-700">
            Les taxes sont calculées selon votre province de résidence. Les prix sont en dollars
            canadiens (CAD).
          </p>
        </div>
      </div>
    </motion.div>
  );
};
