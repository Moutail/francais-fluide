'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/professional/Button';
import { 
  Shield,
  Settings,
  Users,
  ArrowRight,
  Crown
} from 'lucide-react';

export default function AdminBanner() {
  const { user } = useAuth();

  // Afficher seulement pour les administrateurs
  if (!user?.role || !['admin', 'super_admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="font-medium">
            Mode Administrateur - {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
          <span className="text-red-200 text-sm">
            Vous avez accès à l'interface d'administration
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.location.href = '/admin'}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4 mr-1" />
            Interface Admin
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
