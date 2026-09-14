'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastOptions {
  id: string;
  message: string;
  type?: 'success' | 'info';
  duration?: number;
}

export const toastManager = {
  listeners: new Set<(toast: ToastOptions) => void>(),
  addToast: (message: string, type: 'success' | 'info' = 'success', duration = 3000) => {
    const toast = { id: Math.random().toString(36).substr(2, 9), message, type, duration };
    toastManager.listeners.forEach(listener => listener(toast));
  },
  subscribe: (listener: (toast: ToastOptions) => void) => {
    toastManager.listeners.add(listener);
    return () => {
      toastManager.listeners.delete(listener);
    };
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    });
    return unsubscribe;
  }, []);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Info className="w-5 h-5 text-indigo-400" />
          )}
          <p className="text-sm font-medium text-slate-200">{toast.message}</p>
        </div>
      ))}
    </div>,
    document.body
  );
}
