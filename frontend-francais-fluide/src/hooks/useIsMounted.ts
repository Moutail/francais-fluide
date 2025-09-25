// src/hooks/useIsMounted.ts
import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si le composant est monté côté client
 * Utile pour éviter les erreurs d'hydratation Next.js
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
