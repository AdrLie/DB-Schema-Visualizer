'use client';
import { useState } from 'react';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { PrismaExporter, PostgresExporter } from '@schemaflow/schema-exporter';
import { X, Copy, Check } from 'lucide-react';

interface ExportModalProps { schema: DatabaseSchema; onClose: () => void; }

export function ExportModal({ schema, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'prisma' | 'sql'>('prisma');
  const [copied, setCopied] = useState(false);

  const prismaCode = new PrismaExporter().export(schema);
  const sqlCode = new PostgresExporter().export(schema);
  const activeCode = activeTab === 'prisma' ? prismaCode : sqlCode;

  const handleCopy = () => { navigator.clipboard.writeText(activeCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const TABS: { key: 'prisma' | 'sql'; label: string }[] = [{ key: 'prisma', label: 'Prisma Schema' }, { key: 'sql', label: 'PostgreSQL DDL' }];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans p-4"
      style={{ background: 'rgba(42,61,24,0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(145deg,#ffffff,#f5faea)', border: '1px solid rgba(113,131,85,0.15)', boxShadow: '0 0 0 1px rgba(113,131,85,0.06), 0 40px 80px rgba(42,61,24,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' }}>

        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(113,131,85,0.1)', background: 'rgba(238,245,224,0.5)' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#2a3d18' }}>Export Schema</h2>
          <button onClick={onClose} className="p-1.5 rounded-full transition-all"
            style={{ color: 'rgba(74,96,48,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4a6030'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(113,131,85,0.1)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-6 py-3 text-sm font-medium transition-all border-b-2"
              style={{
                borderColor: activeTab === t.key ? '#718355' : 'transparent',
                color: activeTab === t.key ? '#4a6030' : 'rgba(74,96,48,0.45)',
                background: activeTab === t.key ? 'rgba(113,131,85,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.color = '#4a6030'; }}
              onMouseLeave={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.45)'; }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="relative flex-1 p-6 overflow-y-auto max-h-[60vh]" style={{ background: '#f8fdf1' }}>
          <button onClick={handleCopy}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(113,131,85,0.08)', border: '1px solid rgba(113,131,85,0.18)', color: copied ? '#4a6030' : '#718355' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.14)'; (e.currentTarget as HTMLElement).style.color = '#2a3d18'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.08)'; (e.currentTarget as HTMLElement).style.color = copied ? '#4a6030' : '#718355'; }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: '#2a3d18' }}>
            <code>{activeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
