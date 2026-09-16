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
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const toggle = () => {
    if (btnRef.current && !isOpen) { const r = btnRef.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, right: window.innerWidth - r.right }); }
    setIsOpen(o => !o);
  };

  const getCanvas = () => { const el = document.querySelector('.react-flow') as HTMLElement; if (!el) throw new Error('Canvas not found'); return el; };
  const dl = (url: string, ext: string) => { const a = document.createElement('a'); a.href = url; a.download = `${(diagramName.trim() || 'Untitled')}.${ext}`; a.click(); toastManager.addToast(`Exported as ${ext.toUpperCase()}`, 'success'); setIsOpen(false); };

  const exportImg = async (fmt: 'png' | 'svg' | 'pdf') => {
    try {
      const el = getCanvas();
      const controls = el.querySelectorAll('.react-flow__controls,.react-flow__minimap,.react-flow__panel');
      controls.forEach(c => (c as HTMLElement).style.display = 'none');
      toastManager.addToast(`Generating ${fmt.toUpperCase()}…`, 'info');
      const filter = (n: HTMLElement) => !['react-flow__controls','react-flow__minimap','react-flow__panel'].some(c => n.classList?.contains(c));
      if (fmt === 'png') dl(await toPng(el, { filter, backgroundColor: '#120a05', pixelRatio: 4, skipFonts: true }), 'png');
      else if (fmt === 'svg') dl(await toSvg(el, { filter, backgroundColor: '#120a05', skipFonts: true }), 'svg');
      else {
        const url = await toPng(el, { filter, backgroundColor: '#120a05', pixelRatio: 4, skipFonts: true });
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [el.offsetWidth, el.offsetHeight] });
        pdf.addImage(url, 'PNG', 0, 0, el.offsetWidth, el.offsetHeight);
        pdf.save(`${diagramName.trim() || 'Untitled'}.pdf`);
        toastManager.addToast('Exported as PDF', 'success'); setIsOpen(false);
      }
      controls.forEach(c => (c as HTMLElement).style.display = '');
    } catch { toastManager.addToast('Export failed', 'error'); }
  };

  const soon = (f: string) => { toastManager.addToast(`${f} export coming soon`, 'info'); setIsOpen(false); };

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
        style={{
          background: isOpen ? 'rgba(176,137,104,0.18)' : 'rgba(176,137,104,0.1)',
          border: isOpen ? '1px solid rgba(176,137,104,0.35)' : '1px solid rgba(176,137,104,0.2)',
          color: isOpen ? '#ddb892' : '#b08968',
          boxShadow: isOpen ? '0 0 12px rgba(176,137,104,0.15)' : 'none',
        }}
        onMouseEnter={e => { if (!isOpen) { (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(176,137,104,0.12)'; } }}
        onMouseLeave={e => { if (!isOpen) { (e.currentTarget as HTMLElement).style.color = '#b08968'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; } }}>
        <Download className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Export</span>
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="fixed z-[9999] w-56 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, right: pos.right, background: 'linear-gradient(160deg,#1c1009 0%,#120a05 100%)', border: '1px solid rgba(176,137,104,0.12)', boxShadow: '0 0 0 1px rgba(176,137,104,0.06), 0 24px 48px rgba(0,0,0,0.7)' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent" />

            <ESection label="Document" />
            <EItem icon={<BookOpen className="w-3.5 h-3.5" />} label="Publish to dbdocs" onClick={() => soon('dbdocs')} badge="Soon" />
            <EDivider />

            <ESection label="Image" />
            <EItem icon={<FileText className="w-3.5 h-3.5" />} label="Export as PDF" onClick={() => exportImg('pdf')} />
            <EItem icon={<Image className="w-3.5 h-3.5" />} label="Export as PNG" onClick={() => exportImg('png')} />
            <EItem icon={<Image className="w-3.5 h-3.5" />} label="Export as SVG" onClick={() => exportImg('svg')} />
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
  return <div className="px-3 pt-2.5 pb-1"><p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(176,137,104,0.35)' }}>{label}</p></div>;
}
function EDivider() {
  return <div className="mx-3 my-1 h-px" style={{ background: 'rgba(176,137,104,0.08)' }} />;
}
function EItem({ icon, label, onClick, badge }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-all duration-100"
      style={{ color: hov ? '#e6ccb2' : '#b08968', background: hov ? 'rgba(176,137,104,0.07)' : 'transparent' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <span style={{ color: hov ? '#ddb892' : 'rgba(176,137,104,0.4)' }}>{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge
        ? <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(176,137,104,0.12)', color: '#b08968' }}>{badge}</span>
        : <ChevronRight className="w-3 h-3 opacity-20" />}
    </button>
  );
}
