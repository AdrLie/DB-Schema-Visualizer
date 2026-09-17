'use client';
import { Handle, Position } from '@xyflow/react';
import { DatabaseTable } from '@schemaflow/schema-core';
import { KeyRound, Link2, Trash2 } from 'lucide-react';

export function TableNode({ data, selected }: { data: { table: DatabaseTable; searchQuery?: string; onDeleteTable?: (n: string) => void }; selected?: boolean }) {
  const { table, searchQuery = '' } = data;
  const isMatch = searchQuery && table.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isDimmed = searchQuery && !isMatch;

  return (
    <div className={`relative min-w-[260px] font-sans transition-opacity duration-300 ease-out group ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}>

      {/* Green glow halo on select/hover */}
      <div
        className={`absolute -inset-px rounded-2xl transition-all duration-500 pointer-events-none ${selected ? 'opacity-100 blur-md' : 'opacity-0 group-hover:opacity-60 blur-sm'}`}
        style={{ background: selected ? 'linear-gradient(135deg,rgba(113,131,85,0.45),rgba(151,169,124,0.35))' : 'linear-gradient(135deg,rgba(151,169,124,0.3),rgba(181,201,154,0.2))' }} />

      {/* Card body — earthy green background */}
      <div className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-1px]"
        style={{
          background: selected
            ? 'linear-gradient(145deg,#cfe1b9,#d8ebb0)'
            : 'linear-gradient(145deg,#e9f5db,#dff0cc)',
          border: selected ? '1px solid rgba(113,131,85,0.5)' : '1px solid rgba(113,131,85,0.2)',
          boxShadow: selected
            ? '0 0 0 1px rgba(113,131,85,0.18), 0 16px 40px rgba(42,61,24,0.18), inset 0 1px 0 rgba(255,255,255,0.6)'
            : '0 4px 20px rgba(42,61,24,0.1), 0 1px 4px rgba(42,61,24,0.08), inset 0 1px 0 rgba(255,255,255,0.55)',
        }}>
        {/* Top highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

        <Handle type="target" position={Position.Left}
          className="!w-2.5 !h-2.5 !border-2 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
          style={{ backgroundColor: '#87986a', borderColor: '#e9f5db' }} />

        {/* Header */}
        <div className={`px-5 pt-4 pb-3 ${isMatch ? 'bg-white/30' : ''}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ background: '#718355', boxShadow: '0 0 6px rgba(113,131,85,0.5)' }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-25" style={{ background: '#718355' }} />
              </div>
              <h3 className="font-bold text-[14px] tracking-[-0.01em] leading-none" style={{ color: '#1e2d10' }}>
                {table.name}
              </h3>
            </div>
            
            {data.onDeleteTable && (
              <button onClick={(e) => { e.stopPropagation(); data.onDeleteTable!(table.name); }} 
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all hover:bg-red-500/10 hover:text-red-600 cursor-pointer pointer-events-auto"
                style={{ color: 'rgba(74,96,48,0.45)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'rgba(74,96,48,0.55)', paddingLeft: 18 }}>
            {table.columns.length} columns
          </p>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px" style={{ background: 'rgba(113,131,85,0.2)' }} />

        {/* Columns */}
        <div className="px-2 py-2 space-y-0.5">
          {table.columns.map(col => {
            const isFk = table.foreignKeys?.some(fk => fk.columns.includes(col.name));
            const isPk = col.isPrimaryKey;
            return (
              <div key={col.id}
                className="group/row flex items-center justify-between px-3 py-1.5 rounded-xl transition-colors duration-150 relative"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="flex items-center gap-2">
                  {isPk
                    ? <KeyRound className="w-3 h-3 flex-shrink-0" style={{ color: '#718355', filter: 'drop-shadow(0 0 3px rgba(113,131,85,0.4))' }} />
                    : isFk
                      ? <Link2 className="w-3 h-3 flex-shrink-0" style={{ color: '#87986a' }} />
                      : <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center"><div className="w-1 h-1 rounded-full" style={{ background: 'rgba(113,131,85,0.4)' }} /></div>}
                  <span className="text-[12.5px] font-medium tracking-[-0.01em]"
                    style={{ color: isPk ? '#1e2d10' : isFk ? '#2a3d18' : '#2a3d18' }}>
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.06em]" style={{ color: 'rgba(74,96,48,0.55)' }}>
                    {col.type}
                  </span>
                  {!col.nullable && <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ color: 'rgba(42,61,24,0.7)', background: 'rgba(113,131,85,0.15)' }}>NN</span>}
                  {isFk && (
                    <Handle type="source" position={Position.Right} id={col.name}
                      className="!relative !right-0 !transform-none !top-0 !w-1.5 !h-1.5 !border-none !rounded-full !opacity-0 group-hover/row:!opacity-100 transition-opacity"
                      style={{ backgroundColor: '#87986a' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-2" />

        <Handle type="source" position={Position.Right}
          className="!w-2.5 !h-2.5 !border-2 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
          style={{ backgroundColor: '#87986a', borderColor: '#e9f5db' }} />
      </div>
    </div>
  );
}
