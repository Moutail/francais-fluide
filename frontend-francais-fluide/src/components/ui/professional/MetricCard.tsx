// src/components/ui/professional/MetricCard.tsx
import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: LucideIcon;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
}) => {
  const changeClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card className={cn('', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          <p className="mb-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && <p className={cn('text-xs', changeClasses[change.type])}>{change.value}</p>}
        </div>
        <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="size-6 text-blue-600" />
        </div>
      </div>
    </Card>
  );
};
