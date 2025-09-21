import React from 'react';

export const Tooltip: React.FC<{ content: string; children: React.ReactNode }>
  = ({ content, children }) => {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
