'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  hideCloseButton?: boolean;
  className?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-md', hideCloseButton = false, className = '' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 animate-in fade-in duration-200"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div ref={panelRef}
        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${className}`}
        style={{
          background: 'linear-gradient(145deg, #1c1009 0%, #120a05 100%)',
          border: '1px solid rgba(176,137,104,0.14)',
          boxShadow: '0 0 0 1px rgba(176,137,104,0.07), 0 40px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(221,184,146,0.06)',
        }}>
        {/* Top amber accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full pointer-events-none"
          style={{ background: 'rgba(176,137,104,0.05)', filter: 'blur(40px)' }} />

        {!hideCloseButton && (
          <button onClick={onClose} aria-label="Close modal"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'rgba(176,137,104,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        )}

        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
