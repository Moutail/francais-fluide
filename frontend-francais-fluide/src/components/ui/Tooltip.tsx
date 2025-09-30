'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

// Named export to match re-export in src/components/ui/index.ts
export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const positionClasses =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : side === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-2'
        : side === 'bottom'
          ? 'top-full left-1/2 -translate-x-1/2 mt-2'
          : 'right-full top-1/2 -translate-y-1/2 mr-2';

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow ${positionClasses}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
