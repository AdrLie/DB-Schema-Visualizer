'use client';
import { useState, useRef, useEffect } from 'react';
import { FolderPlus, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface CreateWorkspaceModalProps { isOpen: boolean; onClose: () => void; onConfirm: (name: string) => void; }

export function CreateWorkspaceModal({ isOpen, onClose, onConfirm }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setName(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = name.trim(); if (!t) return;
    onConfirm(t); onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <div className="px-7 pt-7 pb-6 font-sans">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#9c6644,#7f5539)', boxShadow: '0 0 20px rgba(127,85,57,0.35)' }}>
            <FolderPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(176,137,104,0.4)' }}>Cloud Workspace</p>
            <h2 className="text-base font-bold leading-tight" style={{ color: '#ede0d4' }}>New Workspace</h2>
          </div>
        </div>

        <form id="create-workspace-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="workspace-name-input" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(176,137,104,0.55)' }}>
              Workspace Name
            </label>
            <input id="workspace-name-input" ref={inputRef} type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. My Project" maxLength={64}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-all placeholder:opacity-25"
              style={{ background: 'rgba(176,137,104,0.07)', border: '1px solid rgba(176,137,104,0.14)', color: '#ede0d4' }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.45)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(176,137,104,0.1)'; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.14)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }} />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button type="button" id="create-workspace-cancel" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(176,137,104,0.07)', border: '1px solid rgba(176,137,104,0.12)', color: 'rgba(176,137,104,0.55)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.55)'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.07)'; }}>
              Cancel
            </button>
            <button type="submit" id="create-workspace-submit" disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: name.trim() ? 'linear-gradient(135deg,#9c6644,#7f5539)' : 'rgba(127,85,57,0.3)', boxShadow: name.trim() ? '0 0 20px rgba(127,85,57,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none' }}>
              Create <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
