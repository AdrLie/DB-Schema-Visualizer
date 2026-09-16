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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(145deg,#1c1009,#120a05)', border: '1px solid rgba(176,137,104,0.14)', boxShadow: '0 0 0 1px rgba(176,137,104,0.06), 0 40px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(221,184,146,0.06)' }}>

        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(176,137,104,0.1)', background: 'rgba(28,16,9,0.6)' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#ede0d4' }}>Export Schema</h2>
          <button onClick={onClose} className="p-1.5 rounded-full transition-all"
            style={{ color: 'rgba(176,137,104,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(176,137,104,0.1)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-6 py-3 text-sm font-medium transition-all border-b-2"
              style={{
                borderColor: activeTab === t.key ? '#b08968' : 'transparent',
                color: activeTab === t.key ? '#ddb892' : 'rgba(176,137,104,0.45)',
                background: activeTab === t.key ? 'rgba(176,137,104,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.color = '#b08968'; }}
              onMouseLeave={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.45)'; }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="relative flex-1 p-6 overflow-y-auto max-h-[60vh]" style={{ background: '#0e0804' }}>
          <button onClick={handleCopy}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(176,137,104,0.1)', border: '1px solid rgba(176,137,104,0.18)', color: copied ? '#ddb892' : '#b08968' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.16)'; (e.currentTarget as HTMLElement).style.color = '#ddb892'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.1)'; (e.currentTarget as HTMLElement).style.color = copied ? '#ddb892' : '#b08968'; }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: '#e6ccb2' }}>
            <code>{activeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
