import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LanguageToolStatusProps {
  isAvailable: boolean | null;
  isChecking: boolean;
  className?: string;
}

export const LanguageToolStatus: React.FC<LanguageToolStatusProps> = ({
  isAvailable,
  isChecking,
  className = ''
}) => {
  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
        />,
        text: 'Vérification...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }

    if (isAvailable === true) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'LanguageTool actif',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }

    if (isAvailable === false) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'LanguageTool indisponible',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    }

    return {
      icon: <Wifi className="w-4 h-4" />,
      text: 'Connexion...',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  const status = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} ${className}`}
    >
      {status.icon}
      <span>{status.text}</span>
    </motion.div>
  );
};
