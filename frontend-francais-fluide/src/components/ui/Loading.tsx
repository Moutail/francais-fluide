import React from 'react';

export const Loading: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2" />
    <span className="text-gray-600 text-sm">{message}</span>
  </div>
);
