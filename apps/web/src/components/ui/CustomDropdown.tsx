'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption { value: string; label: string; }
interface CustomDropdownProps { value: string; options: DropdownOption[]; onChange: (v: string) => void; placeholder?: string; className?: string; activeColor?: string; }

export function CustomDropdown({ value, options, onChange, placeholder = 'Select...', className = '', activeColor }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedOption = options.find(o => o.value === value);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const menuH = Math.min(options.length * 38 + 16, 220);
    const up = spaceBelow < menuH + 8;
    setMenuStyle({ position: 'fixed', left: r.left, width: Math.max(r.width, 160), ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
  }, [options.length]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onOut = (e: MouseEvent) => { if (btnRef.current && !btnRef.current.contains(e.target as Node) && menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
    const onScroll = () => setIsOpen(false);
    document.addEventListener('mousedown', onOut);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { document.removeEventListener('mousedown', onOut); document.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [isOpen, updatePosition]);

  return (
    <div className={className}>
      <button ref={btnRef} type="button" onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none"
        style={{
          background: isOpen ? 'rgba(176,137,104,0.15)' : (activeColor && value) ? 'rgba(156,102,68,0.12)' : 'rgba(176,137,104,0.07)',
          color: isOpen ? '#ddb892' : (activeColor && value) ? '#ddb892' : 'rgba(176,137,104,0.65)',
          border: isOpen ? '1px solid rgba(176,137,104,0.35)' : '1px solid rgba(176,137,104,0.12)',
        }}>
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div ref={menuRef} style={{ ...menuStyle, background: 'linear-gradient(145deg,#1c1009,#120a05)', border: '1px solid rgba(176,137,104,0.12)', boxShadow: '0 0 0 1px rgba(176,137,104,0.06), 0 24px 48px rgba(0,0,0,0.65)' }}
          className="z-[9999] rounded-2xl overflow-hidden backdrop-blur-2xl">
          <div className="max-h-[220px] overflow-y-auto p-2 space-y-0.5">
            {options.map(opt => {
              const isSel = opt.value === value;
              return (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-100"
                  style={{ background: isSel ? 'rgba(176,137,104,0.12)' : 'transparent', color: isSel ? '#ddb892' : 'rgba(176,137,104,0.65)' }}
                  onMouseEnter={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e6ccb2'; } }}
                  onMouseLeave={e => { if (!isSel) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.65)'; } }}>
                  <span>{opt.label}</span>
                  {isSel && <Check className="w-3 h-3 shrink-0" style={{ color: '#b08968' }} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
