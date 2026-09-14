'use client';
import { Handle, Position } from '@xyflow/react';
import { DatabaseTable } from '@schemaflow/schema-core';
import { KeyRound, Link2 } from 'lucide-react';

export function TableNode({ data, selected }: { data: { table: DatabaseTable, searchQuery?: string }, selected?: boolean }) {
  const { table, searchQuery = '' } = data;

  const isMatch = searchQuery && table.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isDimmed = searchQuery && !isMatch;

  return (
    <div className={`relative min-w-[260px] font-sans transition-all duration-300 ease-out group ${isDimmed ? 'opacity-15 scale-95 grayscale' : 'opacity-100 scale-100'}`}>
      
      {/* Glow halo */}
      <div
        className={`absolute -inset-px rounded-2xl transition-all duration-500 pointer-events-none ${
          selected
            ? 'opacity-100 blur-md'
            : 'opacity-0 group-hover:opacity-50 blur-sm'
        }`}
        style={{
          background: selected
            ? 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:translate-y-[-1px]"
        style={{
          background: selected
            ? 'linear-gradient(145deg, rgba(22,26,52,0.97), rgba(15,18,40,0.98))'
            : 'linear-gradient(145deg, rgba(16,20,42,0.92), rgba(10,12,28,0.95))',
          border: selected
            ? '1px solid rgba(99,102,241,0.35)'
            : '1px solid rgba(255,255,255,0.065)',
          boxShadow: selected
            ? '0 0 0 1px rgba(99,102,241,0.15), 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Top edge highlight */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-slate-900 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
        />

        {/* Header */}
        <div
          className={`px-5 pt-4 pb-3 ${isMatch ? 'bg-indigo-500/10' : ''}`}
        >
          <div className="flex items-center gap-2.5 mb-1">
            {/* Status dot with pulse */}
            <div className="relative flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-30" />
            </div>
            <h3 className="font-bold text-[14px] text-slate-100 tracking-[-0.01em] leading-none">
              {table.name}
            </h3>
          </div>
          <p className="text-[10px] text-slate-600 pl-4.5 font-medium tracking-widest uppercase pl-[18px]">
            {table.columns.length} columns
          </p>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Columns */}
        <div className="px-2 py-2 space-y-0.5">
          {table.columns.map((col) => {
            const isFk = table.foreignKeys?.some(fk => fk.columns.includes(col.name));
            const isPk = col.isPrimaryKey;
            return (
              <div
                key={col.id}
                className="group/row flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-150 relative"
              >
                <div className="flex items-center gap-2">
                  {isPk ? (
                    <KeyRound className="w-3 h-3 text-amber-400/80 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)] flex-shrink-0" />
                  ) : isFk ? (
                    <Link2 className="w-3 h-3 text-violet-400/70 flex-shrink-0" />
                  ) : (
                    <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                    </div>
                  )}
                  <span className={`text-[12.5px] font-medium tracking-[-0.01em] ${isPk ? 'text-amber-100/90' : isFk ? 'text-violet-200/80' : 'text-slate-300'}`}>
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-600 group-hover/row:text-slate-500 transition-colors uppercase tracking-[0.06em]">
                    {col.type}
                  </span>
                  {!col.nullable && (
                    <span className="text-[9px] font-bold text-slate-700 group-hover/row:text-slate-600">NN</span>
                  )}
                  {isFk && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={col.name}
                      className="!relative !right-0 !transform-none !top-0 !w-1.5 !h-1.5 !bg-violet-400 !border-none !rounded-full !opacity-0 group-hover/row:!opacity-100 transition-opacity"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom padding */}
        <div className="h-2" />

        <Handle
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-slate-900 !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}
