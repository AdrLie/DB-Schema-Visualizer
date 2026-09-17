'use client';
import { useState } from 'react';
import { Database, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { toastManager } from '../ui/Toast';

interface AuthModalProps { isOpen: boolean; onClose: () => void; onSuccess: (token: string) => void; }

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

type Tab = 'signin' | 'signup';

const INPUT_STYLE = { background: 'rgba(113,131,85,0.06)', border: '1px solid rgba(113,131,85,0.18)', color: '#2a3d18' };
const INPUT_FOCUS = { border: '1px solid rgba(113,131,85,0.5)', boxShadow: '0 0 0 3px rgba(113,131,85,0.1)' };

function AInput({ id, type, value, onChange, placeholder, icon: Icon, extra }: { id: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; icon: any; extra?: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(74,96,48,0.45)' }} />
      <input id={id} type={type} required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition-all placeholder:opacity-35"
        style={INPUT_STYLE}
        onFocus={e => Object.assign((e.currentTarget as HTMLElement).style, INPUT_FOCUS)}
        onBlur={e => Object.assign((e.currentTarget as HTMLElement).style, { border: '1px solid rgba(113,131,85,0.18)', boxShadow: 'none' })} />
      {extra}
    </div>
  );
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => { setEmail(''); setPassword(''); setConfirmPassword(''); setShowPassword(false); };
  const switchTab = (t: Tab) => { setTab(t); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'signup' && password !== confirmPassword) { toastManager.addToast('Passwords do not match', 'error'); return; }
    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}${tab === 'signin' ? '/auth/login' : '/auth/register'}`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Authentication failed'); }
      const data = await res.json();
      if (data.access_token) { onSuccess(data.access_token); toastManager.addToast(tab === 'signin' ? 'Welcome back!' : 'Account created!', 'success'); }
    } catch (err: any) { toastManager.addToast(err.message || 'Authentication failed', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm" hideCloseButton>
      <div className="px-7 pt-7 pb-7 font-sans">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center transition-all text-lg leading-none"
          style={{ color: 'rgba(74,96,48,0.4)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4a6030'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>×</button>

        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex justify-center mb-2 mt-4 relative h-16 w-full">
            <img src="/logo.svg" alt="Schma Logo" className="absolute w-48 max-w-none pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(74,96,48,0.55)' }}>
            {tab === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(113,131,85,0.07)', border: '1px solid rgba(113,131,85,0.12)' }}>
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button key={t} id={`auth-tab-${t}`} onClick={() => switchTab(t)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
              style={{
                color: tab === t ? '#2a3d18' : 'rgba(74,96,48,0.45)',
                background: tab === t ? '#ffffff' : 'transparent',
                boxShadow: tab === t ? '0 1px 3px rgba(42,61,24,0.12)' : 'none',
              }}>
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[{ label: 'Google', icon: <GoogleIcon />, key: 'google' }, { label: 'GitHub', icon: <GitHubIcon />, key: 'github' }].map(s => (
            <button key={s.key} id={`auth-${s.key}-btn`}
              onClick={() => toastManager.addToast(`${s.label} login coming soon`, 'info')}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'rgba(113,131,85,0.07)', border: '1px solid rgba(113,131,85,0.14)', color: '#4a6030' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.14)'; }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(113,131,85,0.15)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'rgba(74,96,48,0.4)' }}>or email</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(113,131,85,0.15)' }} />
        </div>

        {/* Form */}
        <form id="auth-form" onSubmit={handleSubmit} className="space-y-2.5">
          <AInput id="auth-email" type="email" value={email} onChange={setEmail} placeholder="Email address" icon={Mail} />
          <AInput id="auth-password" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Password" icon={Lock}
            extra={<button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(74,96,48,0.4)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4a6030'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.4)'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>} />
          {tab === 'signup' && <AInput id="auth-confirm-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password" icon={Lock} />}
          {tab === 'signin' && (
            <div className="text-right">
              <button type="button" className="text-[11px] transition-colors" style={{ color: 'rgba(74,96,48,0.45)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4a6030'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.45)'}
                onClick={() => toastManager.addToast('Password reset coming soon', 'info')}>
                Forgot password?
              </button>
            </div>
          )}

          <button id="auth-submit-btn" type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg,#87986a,#718355)', boxShadow: isLoading ? 'none' : '0 4px 16px rgba(113,131,85,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            {isLoading
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Please wait…</>
              : <>{tab === 'signin' ? 'Sign In' : 'Create Account'}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(74,96,48,0.45)' }}>
          {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
            className="font-semibold transition-colors" style={{ color: '#718355' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4a6030'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#718355'}>
            {tab === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </Modal>
  );
}
