 'use client';

 import React, { useEffect } from 'react';

 interface ModalProps {
   open: boolean;
   onClose?: () => void;
   title?: string;
   children: React.ReactNode;
   className?: string;
 }

 // Named export to match re-export in src/components/ui/index.ts
 export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
   useEffect(() => {
     if (!open) return;
     const onKey = (e: KeyboardEvent) => {
       if (e.key === 'Escape') onClose?.();
     };
     window.addEventListener('keydown', onKey);
     return () => window.removeEventListener('keydown', onKey);
   }, [open, onClose]);

   if (!open) return null;

   return (
     <div
       className="fixed inset-0 z-50 flex items-center justify-center"
       role="dialog"
       aria-modal="true"
       aria-label={title}
     >
       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
       <div className={`relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 ${className}`}>
         {title && (
           <div className="px-4 py-3 border-b border-gray-200">
             <h2 className="text-base font-semibold text-gray-900">{title}</h2>
           </div>
         )}
         <div className="p-4">{children}</div>
       </div>
     </div>
   );
 }

