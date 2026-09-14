'use client';
import { useState } from 'react';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { PrismaExporter, PostgresExporter } from '@schemaflow/schema-exporter';
import { X, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  schema: DatabaseSchema;
  onClose: () => void;
}

export function ExportModal({ schema, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'prisma' | 'sql'>('prisma');
  const [copied, setCopied] = useState(false);

  const prismaExporter = new PrismaExporter();
  const sqlExporter = new PostgresExporter();

  const prismaCode = prismaExporter.export(schema);
  const sqlCode = sqlExporter.export(schema);

  const activeCode = activeTab === 'prisma' ? prismaCode : sqlCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white">Export Schema</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-slate-900">
          <button
            onClick={() => setActiveTab('prisma')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'prisma' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            Prisma Schema
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sql' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            PostgreSQL DDL
          </button>
        </div>

        {/* Code Content */}
        <div className="relative flex-1 bg-slate-950 p-6 overflow-y-auto max-h-[60vh]">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-white transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
            <code>{activeCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
