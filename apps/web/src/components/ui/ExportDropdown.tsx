'use client';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, FileText, Image, Database, Download, ChevronRight } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toastManager } from './Toast';

interface ExportDropdownProps { onExportPostgres: () => void; diagramName: string; }

export function ExportDropdown({ onExportPostgres, diagramName }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFmt, setLoadingFmt] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const toggle = () => {
    if (btnRef.current && !isOpen) { const r = btnRef.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, right: window.innerWidth - r.right }); }
    setIsOpen(o => !o);
  };

  const exportImg = (fmt: 'png' | 'svg' | 'pdf') => {
    setLoadingFmt(fmt);
    window.dispatchEvent(new CustomEvent('export-image', { 
      detail: { 
        fmt, 
        diagramName, 
        onComplete: () => { setLoadingFmt(null); setIsOpen(false); }
      } 
    }));
  };

  const soon = (f: string) => { toastManager.addToast(`${f} export coming soon`, 'info'); setIsOpen(false); };

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
        style={{
          background: isOpen ? 'rgba(113,131,85,0.15)' : 'rgba(113,131,85,0.1)',
          border: isOpen ? '1px solid rgba(113,131,85,0.35)' : '1px solid rgba(113,131,85,0.2)',
          color: isOpen ? '#2a3d18' : '#4a6030',
          boxShadow: isOpen ? '0 0 12px rgba(113,131,85,0.12)' : 'none',
        }}
        onMouseEnter={e => { if (!isOpen) { (e.currentTarget as HTMLElement).style.color = '#2a3d18'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.14)'; } }}
        onMouseLeave={e => { if (!isOpen) { (e.currentTarget as HTMLElement).style.color = '#4a6030'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.1)'; } }}>
        <Download className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Export</span>
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="fixed z-[9999] w-56 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, right: pos.right, background: 'linear-gradient(160deg,#ffffff 0%,#f5faea 100%)', border: '1px solid rgba(113,131,85,0.15)', boxShadow: '0 0 0 1px rgba(113,131,85,0.06), 0 24px 48px rgba(42,61,24,0.15)' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />

            <ESection label="Document" />
            <EItem icon={<BookOpen className="w-3.5 h-3.5" />} label="Publish to dbdocs" onClick={() => soon('dbdocs')} badge="Soon" />
            <EDivider />

            <ESection label="Image" />
            <EItem icon={<FileText className="w-3.5 h-3.5" />} label="Export as PDF" onClick={() => exportImg('pdf')} isLoading={loadingFmt === 'pdf'} />
            <EItem icon={<Image className="w-3.5 h-3.5" />} label="Export as PNG" onClick={() => exportImg('png')} isLoading={loadingFmt === 'png'} />
            <EItem icon={<Image className="w-3.5 h-3.5" />} label="Export as SVG" onClick={() => exportImg('svg')} isLoading={loadingFmt === 'svg'} />
            <EDivider />

            <ESection label="Code" />
            <EItem icon={<Database className="w-3.5 h-3.5" />} label="PostgreSQL DDL" onClick={() => { onExportPostgres(); setIsOpen(false); }} />
            <EItem icon={<Database className="w-3.5 h-3.5" />} label="MySQL" onClick={() => soon('MySQL')} badge="Soon" />
            <EItem icon={<Database className="w-3.5 h-3.5" />} label="SQL Server" onClick={() => soon('SQL Server')} badge="Soon" />
            <EItem icon={<Database className="w-3.5 h-3.5" />} label="Oracle SQL" onClick={() => soon('Oracle SQL')} badge="Soon" />
            <div className="pb-1.5" />
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function ESection({ label }: { label: string }) {
  return <div className="px-3 pt-2.5 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(74,96,48,0.4)' }}>{label}</p></div>;
}
function EDivider() {
  return <div className="mx-3 my-1 h-px" style={{ background: 'rgba(113,131,85,0.1)' }} />;
}
function EItem({ icon, label, onClick, badge, isLoading }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: string; isLoading?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={isLoading}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-all duration-100"
      style={{ color: hov ? '#2a3d18' : '#4a6030', background: hov ? 'rgba(113,131,85,0.07)' : 'transparent', opacity: isLoading ? 0.7 : 1 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <span style={{ color: hov ? '#718355' : 'rgba(113,131,85,0.45)' }}>
        {isLoading ? (
          <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : icon}
      </span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge
        ? <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(113,131,85,0.1)', color: '#718355' }}>{badge}</span>
        : <ChevronRight className="w-3 h-3 opacity-20" />}
    </button>
  );
}
