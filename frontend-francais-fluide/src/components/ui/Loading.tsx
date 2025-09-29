 'use client';

 import React from 'react';
 import { Loader2 } from 'lucide-react';

 interface LoadingProps {
   text?: string;
   size?: 'sm' | 'md' | 'lg';
   fullScreen?: boolean;
   className?: string;
 }

 // Named export to match re-export in src/components/ui/index.ts
 export function Loading({
   text = 'Chargement...',
   size = 'md',
   fullScreen = false,
   className = ''
 }: LoadingProps) {
   const sizeClasses =
     size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

   const content = (
     <div className={`flex items-center justify-center gap-2 ${className}`}>
       <Loader2 className={`${sizeClasses} animate-spin text-blue-600`} />
       {text && <span className="text-gray-700 text-sm">{text}</span>}
     </div>
   );

   if (fullScreen) {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <div className="bg-white rounded-lg px-4 py-3 shadow">
           {content}
         </div>
       </div>
     );
   }

   return content;
 }

