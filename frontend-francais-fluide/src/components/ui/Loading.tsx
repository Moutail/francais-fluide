import React from 'react';

export const Loading: React.FC<{ label?: string }> = ({ label = 'Chargement...' }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
    <span className="ml-2 text-gray-600 text-sm">{label}</span>
  </div>
);

export default Loading;
