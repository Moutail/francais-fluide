'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/professional/Button';
import { Shield, Settings, Users, ArrowRight, Crown } from 'lucide-react';

export default function AdminBanner() {
  const { user } = useAuth();

  // Afficher seulement pour les administrateurs
  if (!user?.role || !['admin', 'super_admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <span className="font-medium">
            Mode Administrateur - {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
          <span className="text-sm text-red-200">
            Vous avez accès à l'interface d'administration
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => (window.location.href = '/admin')}
            variant="secondary"
            size="sm"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <Settings className="mr-1 h-4 w-4" />
            Interface Admin
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
