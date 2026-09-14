'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, FileText, Image, Database, Download } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toastManager } from './Toast';

interface ExportDropdownProps {
  onExportPostgres: () => void;
  diagramName: string;
}

export function ExportDropdown({ onExportPostgres, diagramName }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const handleToggle = () => {
    if (buttonRef.current && !isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        // We'll close it in the portal click handler if needed, or rely on a backdrop
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotImplemented = (feature: string) => {
    toastManager.addToast(`${feature} Export coming soon!`, 'info');
    setIsOpen(false);
  };

  const getCanvasElement = () => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) throw new Error('Canvas not found');
    return el;
  };

  const downloadFile = (dataUrl: string, extension: string) => {
    const name = diagramName.trim() || 'Untitled Diagram';
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name}.${extension}`;
    a.click();
    toastManager.addToast(`Exported to ${extension.toUpperCase()} successfully!`, 'success');
    setIsOpen(false);
  };

  const exportToImage = async (format: 'png' | 'svg' | 'pdf') => {
    try {
      const el = getCanvasElement();
      // Hide UI controls temporarily for clean export
      const controls = el.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__panel');
      controls.forEach(c => (c as HTMLElement).style.display = 'none');

      toastManager.addToast(`Generating ${format.toUpperCase()}...`, 'info');

      // We use backgroundColor to match the canvas theme
      const filter = (node: HTMLElement) => {
        const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel'];
        return !exclusionClasses.some((classname) => node.classList?.contains(classname));
      };

      if (format === 'png') {
        const dataUrl = await toPng(el, { filter, backgroundColor: '#020617', pixelRatio: 4, skipFonts: true });
        downloadFile(dataUrl, 'png');
      } else if (format === 'svg') {
        const dataUrl = await toSvg(el, { filter, backgroundColor: '#020617', skipFonts: true });
        downloadFile(dataUrl, 'svg');
      } else if (format === 'pdf') {
        const dataUrl = await toPng(el, { filter, backgroundColor: '#020617', pixelRatio: 4, skipFonts: true });
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [el.offsetWidth, el.offsetHeight]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, el.offsetWidth, el.offsetHeight);
        const name = diagramName.trim() || 'Untitled Diagram';
        pdf.save(`${name}.pdf`);
        toastManager.addToast(`Exported to PDF successfully!`, 'success');
        setIsOpen(false);
      }

      // Restore UI controls
      controls.forEach(c => (c as HTMLElement).style.display = '');

    } catch (err) {
      console.error(err);
      toastManager.addToast(`Failed to export ${format.toUpperCase()}`, 'info');
    }
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isOpen ? 'bg-white/10 text-white' : 'text-slate-300 bg-white/5 hover:bg-white/10'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div 
            className="fixed z-[9999] w-64 bg-slate-800 border border-slate-700 shadow-2xl rounded-md py-1.5 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: position.top, right: position.right }}
          >
            <button onClick={() => handleNotImplemented('dbdocs')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <BookOpen className="w-4 h-4 text-slate-400" />
              Publish document (to dbdocs)
            </button>
            
            <div className="h-px bg-slate-700 my-1.5 mx-2" />

            <button onClick={() => exportToImage('pdf')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <FileText className="w-4 h-4 text-slate-400" />
              To PDF
            </button>
            <button onClick={() => exportToImage('png')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Image className="w-4 h-4 text-slate-400" />
              To PNG
            </button>
            <button onClick={() => exportToImage('svg')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Image className="w-4 h-4 text-slate-400" />
              To SVG
            </button>

            <div className="h-px bg-slate-700 my-1.5 mx-2" />

            <button 
              onClick={() => {
                onExportPostgres();
                setIsOpen(false);
              }} 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Database className="w-4 h-4 text-slate-400" />
              To PostgreSQL
            </button>
            <button onClick={() => handleNotImplemented('MySQL')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Database className="w-4 h-4 text-slate-400" />
              To MySQL
            </button>
            <button onClick={() => handleNotImplemented('SQL Server')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Database className="w-4 h-4 text-slate-400" />
              To SQL Server
            </button>
            <button onClick={() => handleNotImplemented('Oracle SQL')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Database className="w-4 h-4 text-slate-400" />
              To Oracle SQL
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
