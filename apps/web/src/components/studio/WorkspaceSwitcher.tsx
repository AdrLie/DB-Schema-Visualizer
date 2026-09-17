import { ChevronDown, Plus, LogOut, Check, Layers, LogIn } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toastManager } from '../ui/Toast';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface WorkspaceSwitcherProps {
  token: string | null;
  onLoginRequest: () => void;
  onLogout: () => void;
  activeWorkspaceId: string | null;
  onWorkspaceChange: (id: string | null) => void;
}

function getInitials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const WS_GRADIENTS = [
  'linear-gradient(135deg,#87986a,#718355)',
  'linear-gradient(135deg,#97a97c,#87986a)',
  'linear-gradient(135deg,#718355,#4a6030)',
  'linear-gradient(135deg,#b5c99a,#97a97c)',
  'linear-gradient(135deg,#87986a,#97a97c)',
];
function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return WS_GRADIENTS[Math.abs(h) % WS_GRADIENTS.length];
}

export function WorkspaceSwitcher({ token, onLoginRequest, onLogout, activeWorkspaceId, onWorkspaceChange }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) { setWorkspaces([]); return; }
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setWorkspaces(await r.json());
      } catch { /* silent */ }
    };
    load();
  }, [token, isOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleCreate = async (name: string) => {
    if (!token) return;
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (r.ok) {
        const ws = await r.json();
        setWorkspaces(p => [ws, ...p]);
        onWorkspaceChange(ws.id);
        setIsOpen(false);
        toastManager.addToast(`Workspace "${name}" created`, 'success');
      }
    } catch { toastManager.addToast('Failed to create workspace', 'error'); }
  };

  const activeName = activeWorkspaceId === null
    ? 'Personal'
    : workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Workspace';

  return (
    <>
      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button id="workspace-switcher-trigger" onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150 select-none"
          style={{
            background: isOpen ? 'rgba(113,131,85,0.12)' : 'rgba(113,131,85,0.07)',
            border: isOpen ? '1px solid rgba(113,131,85,0.28)' : '1px solid rgba(113,131,85,0.14)',
          }}
          onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.1)'; }}
          onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.07)'; }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white shadow-sm"
            style={{ background: activeWorkspaceId === null ? 'linear-gradient(135deg,#87986a,#718355)' : gradientFor(activeWorkspaceId) }}>
            {activeWorkspaceId === null ? <Layers className="w-2.5 h-2.5" /> : getInitials(activeName)}
          </div>
          <span className="text-sm font-medium max-w-[100px] truncate" style={{ color: '#2a3d18' }}>{activeName}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(74,96,48,0.5)' }} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-[224px] rounded-xl overflow-hidden z-[200]"
            style={{
              background: 'linear-gradient(160deg,#ffffff 0%,#f5faea 100%)',
              border: '1px solid rgba(113,131,85,0.14)',
              boxShadow: '0 0 0 1px rgba(113,131,85,0.06), 0 24px 48px rgba(42,61,24,0.15)',
            }}>
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(74,96,48,0.4)' }}>Workspaces</p>
            </div>

            <WsItem label="Personal" sublabel="Local storage" isActive={activeWorkspaceId === null}
              gradient="linear-gradient(135deg,#87986a,#718355)"
              icon={<Layers className="w-2.5 h-2.5" />}
              onClick={() => { onWorkspaceChange(null); setIsOpen(false); }} />

            {workspaces.map(ws => (
              <WsItem key={ws.id} label={ws.name} isActive={activeWorkspaceId === ws.id}
                gradient={gradientFor(ws.id)} initials={getInitials(ws.name)}
                onClick={() => { onWorkspaceChange(ws.id); setIsOpen(false); }} />
            ))}

            <div className="mx-3 my-1.5 h-px" style={{ background: 'rgba(113,131,85,0.1)' }} />

            {token ? (
              <>
                <MBtn icon={<Plus className="w-3.5 h-3.5" />} label="New Workspace" onClick={() => { setIsOpen(false); setShowCreateModal(true); }} />
                <MBtn icon={<LogOut className="w-3.5 h-3.5" />} label="Sign Out" onClick={() => { onLogout(); setIsOpen(false); }} danger />
              </>
            ) : (
              <div className="px-3 pb-3 pt-1">
                <button id="workspace-signin-btn" onClick={() => { onLoginRequest(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-105 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#87986a,#718355)', boxShadow: '0 4px 16px rgba(113,131,85,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in for cloud sync
                </button>
                <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(74,96,48,0.4)' }}>Sync diagrams across devices</p>
              </div>
            )}
            <div className="pb-1.5" />
          </div>
        )}
      </div>

      <CreateWorkspaceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onConfirm={handleCreate} />
    </>
  );
}

function WsItem({ label, sublabel, isActive, gradient, icon, initials, onClick }: {
  label: string; sublabel?: string; isActive: boolean; gradient: string;
  icon?: React.ReactNode; initials?: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100"
      style={{ background: isActive ? 'rgba(113,131,85,0.08)' : hov ? 'rgba(113,131,85,0.04)' : 'transparent' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white shadow-sm"
        style={{ background: gradient }}>{icon ?? initials}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: isActive ? '#2a3d18' : '#4a6030' }}>{label}</p>
        {sublabel && <p className="text-[10px] truncate" style={{ color: 'rgba(74,96,48,0.45)' }}>{sublabel}</p>}
      </div>
      {isActive && <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#718355' }} />}
    </button>
  );
}

function MBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all duration-100"
      style={{
        color: danger ? (hov ? '#c45c3a' : '#a04832') : (hov ? '#2a3d18' : 'rgba(74,96,48,0.7)'),
        background: hov ? (danger ? 'rgba(196,92,58,0.08)' : 'rgba(113,131,85,0.06)') : 'transparent',
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {icon}{label}
    </button>
  );
}
