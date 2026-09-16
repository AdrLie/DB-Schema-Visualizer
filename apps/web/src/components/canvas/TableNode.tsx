'use client';
import { Handle, Position } from '@xyflow/react';
import { DatabaseTable } from '@schemaflow/schema-core';
import { KeyRound, Link2 } from 'lucide-react';

export function TableNode({ data, selected }: { data: { table: DatabaseTable; searchQuery?: string }; selected?: boolean }) {
  const { table, searchQuery = '' } = data;
  const isMatch = searchQuery && table.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isDimmed = searchQuery && !isMatch;

  return (
    <div className={`relative min-w-[260px] font-sans transition-all duration-300 ease-out group ${isDimmed ? 'opacity-10 scale-95 grayscale' : 'opacity-100 scale-100'}`}>

      {/* Warm glow halo */}
      <div
        className={`absolute -inset-px rounded-2xl transition-all duration-500 pointer-events-none ${selected ? 'opacity-100 blur-md' : 'opacity-0 group-hover:opacity-60 blur-sm'}`}
        style={{ background: selected ? 'linear-gradient(135deg,rgba(156,102,68,0.5),rgba(176,137,104,0.4))' : 'linear-gradient(135deg,rgba(176,137,104,0.25),rgba(221,184,146,0.15))' }} />

      {/* Card body */}
      <div className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-1px]"
        style={{
          background: selected ? 'linear-gradient(145deg,#231508,#1c1009)' : 'linear-gradient(145deg,#1c1009,#160c05)',
          border: selected ? '1px solid rgba(176,137,104,0.4)' : '1px solid rgba(176,137,104,0.12)',
          boxShadow: selected
            ? '0 0 0 1px rgba(176,137,104,0.15), 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(221,184,146,0.08)'
            : '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(221,184,146,0.04)',
        }}>
        {/* Top highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-800/20 to-transparent pointer-events-none" />

        <Handle type="target" position={Position.Left}
          className="!w-2.5 !h-2.5 !border-2 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
          style={{ backgroundColor: '#b08968', borderColor: '#120a05' }} />

        {/* Header */}
        <div className={`px-5 pt-4 pb-3 ${isMatch ? 'bg-amber-900/15' : ''}`}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="relative flex-shrink-0">
              <div className="w-2 h-2 rounded-full" style={{ background: '#ddb892', boxShadow: '0 0 6px rgba(221,184,146,0.6)' }} />
              <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30" style={{ background: '#ddb892' }} />
            </div>
            <h3 className="font-bold text-[14px] tracking-[-0.01em] leading-none" style={{ color: '#ede0d4' }}>
              {table.name}
            </h3>
          </div>
          <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'rgba(176,137,104,0.4)', paddingLeft: 18 }}>
            {table.columns.length} columns
          </p>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px" style={{ background: 'rgba(176,137,104,0.08)' }} />

        {/* Columns */}
        <div className="px-2 py-2 space-y-0.5">
          {table.columns.map(col => {
            const isFk = table.foreignKeys?.some(fk => fk.columns.includes(col.name));
            const isPk = col.isPrimaryKey;
            return (
              <div key={col.id}
                className="group/row flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors duration-150 relative"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="flex items-center gap-2">
                  {isPk
                    ? <KeyRound className="w-3 h-3 flex-shrink-0" style={{ color: '#ddb892', filter: 'drop-shadow(0 0 4px rgba(221,184,146,0.5))' }} />
                    : isFk
                      ? <Link2 className="w-3 h-3 flex-shrink-0" style={{ color: '#b08968' }} />
                      : <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center"><div className="w-1 h-1 rounded-full" style={{ background: 'rgba(176,137,104,0.3)' }} /></div>}
                  <span className="text-[12.5px] font-medium tracking-[-0.01em]"
                    style={{ color: isPk ? '#e6ccb2' : isFk ? '#ddb892' : '#ede0d4' }}>
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.06em]" style={{ color: 'rgba(176,137,104,0.4)' }}>
                    {col.type}
                  </span>
                  {!col.nullable && <span className="text-[9px] font-bold" style={{ color: 'rgba(176,137,104,0.35)' }}>NN</span>}
                  {isFk && (
                    <Handle type="source" position={Position.Right} id={col.name}
                      className="!relative !right-0 !transform-none !top-0 !w-1.5 !h-1.5 !border-none !rounded-full !opacity-0 group-hover/row:!opacity-100 transition-opacity"
                      style={{ backgroundColor: '#9c6644' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-2" />

        <Handle type="source" position={Position.Right}
          className="!w-2.5 !h-2.5 !border-2 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
          style={{ backgroundColor: '#9c6644', borderColor: '#120a05' }} />
      </div>
    </div>
  );
}
