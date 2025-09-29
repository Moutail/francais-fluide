// src/app/api/_utils/backend.ts

export const BACKEND_BASE: string =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Convenience wrapper to build full backend URLs
export function backendUrl(path: string): string {
  if (!path.startsWith('/')) return `${BACKEND_BASE}/${path}`;
  return `${BACKEND_BASE}${path}`;
}
