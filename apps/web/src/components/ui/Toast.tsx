'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastOptions { id: string; message: string; type?: 'success' | 'info' | 'error'; duration?: number; }

export const toastManager = {
  listeners: new Set<(t: ToastOptions) => void>(),
  addToast: (message: string, type: 'success' | 'info' | 'error' = 'success', duration = 3500) => {
    const t = { id: Math.random().toString(36).substr(2, 9), message, type, duration };
    toastManager.listeners.forEach(l => l(t));
  },
  subscribe: (l: (t: ToastOptions) => void) => { toastManager.listeners.add(l); return () => toastManager.listeners.delete(l); },
};

const V = {
  success: { icon: <CheckCircle2 className="w-4 h-4 flex-shrink-0" />, color: '#4a6030', bg: 'rgba(181,201,154,0.25)', border: 'rgba(113,131,85,0.3)', bar: '#718355' },
  error:   { icon: <AlertCircle   className="w-4 h-4 flex-shrink-0" />, color: '#c45c3a', bg: 'rgba(220,100,70,0.12)',   border: 'rgba(196,92,58,0.3)',   bar: '#c45c3a' },
  info:    { icon: <Info          className="w-4 h-4 flex-shrink-0" />, color: '#4a6030', bg: 'rgba(151,169,124,0.2)',   border: 'rgba(113,131,85,0.25)', bar: '#87986a' },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  useEffect(() => {
    const unsub = toastManager.subscribe(t => {
      setToasts(p => [...p, t]);
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), t.duration);
    });
    return () => { unsub(); };
  }, []);
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const v = V[t.type ?? 'info'];
        return (
          <div key={t.id}
            className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 min-w-[260px] max-w-[340px] relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${v.bg}, rgba(245,250,234,0.97))`, border: `1px solid ${v.border}`, backdropFilter: 'blur(16px)', boxShadow: `0 8px 32px rgba(42,61,24,0.15)` }}>
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: v.bar }} />
            <span style={{ color: v.color }}>{v.icon}</span>
            <p className="text-sm font-medium flex-1 leading-tight" style={{ color: '#2a3d18' }}>{t.message}</p>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              className="w-5 h-5 flex items-center justify-center rounded-md transition-colors flex-shrink-0"
              style={{ color: 'rgba(74,96,48,0.4)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4a6030'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.4)'}>
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
