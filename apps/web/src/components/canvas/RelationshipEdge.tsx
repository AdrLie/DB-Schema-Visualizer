'use client';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

const CARDINALITY_OPTIONS: { value: Cardinality; label: string; source: string; target: string; description: string }[] = [
  { value: 'one-to-one',   label: '1 — 1',  source: '1', target: '1', description: 'One to One' },
  { value: 'one-to-many',  label: '1 — N',  source: '1', target: 'N', description: 'One to Many' },
  { value: 'many-to-many', label: 'N — M',  source: 'N', target: 'M', description: 'Many to Many' },
];

interface RelationshipEdgeProps extends EdgeProps {
  data?: {
    cardinality?: Cardinality;
    onCardinalityChange?: (edgeId: string, cardinality: Cardinality) => void;
  };
}

export function RelationshipEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected, data,
}: RelationshipEdgeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });

  const cardinality: Cardinality = data?.cardinality || 'one-to-many';
  const option = CARDINALITY_OPTIONS.find(o => o.value === cardinality) || CARDINALITY_OPTIONS[1];

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 12,
  });

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerPos({ x: e.clientX, y: e.clientY });
    setShowPicker(v => !v);
  }, []);

  const handleSelect = useCallback((val: Cardinality) => {
    data?.onCardinalityChange?.(id, val);
    setShowPicker(false);
  }, [id, data]);

  const strokeColor = selected ? '#818cf8' : 'rgba(148,163,184,0.25)';
  const strokeWidth = selected ? 2 : 1.5;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: cardinality === 'many-to-many' ? '6 3' : 'none',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {/* Source marker */}
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${sourceX + (labelX - sourceX) * 0.2}px, ${sourceY + (labelY - sourceY) * 0.2}px)` }}
          className="absolute pointer-events-none nopan"
        >
          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950 px-1 py-0.5 rounded">
            {option.source}
          </span>
        </div>

        {/* Target marker */}
        <div
          style={{ transform: `translate(-50%, -50%) translate(${targetX + (labelX - targetX) * 0.2}px, ${targetY + (labelY - targetY) * 0.2}px)` }}
          className="absolute pointer-events-none nopan"
        >
          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950 px-1 py-0.5 rounded">
            {option.target}
          </span>
        </div>

        {/* Center clickable label */}
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          className="absolute nopan"
        >
          <button
            onClick={handleLabelClick}
            className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
              selected
                ? 'bg-indigo-950 border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-slate-950/90 border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/15'
            }`}
          >
            {option.label}
          </button>
        </div>
      </EdgeLabelRenderer>

      {/* Cardinality picker portal */}
      {showPicker && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowPicker(false)} />

          {/* Picker */}
          <div
            className="fixed z-[9999] p-1.5 rounded-2xl overflow-hidden"
            style={{
              left: pickerPos.x,
              top: pickerPos.y + 8,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(145deg, rgba(15,18,35,0.98), rgba(10,12,28,0.99))',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.7)',
            }}
          >
            <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-2 pb-1.5">Relationship Type</p>
            {CARDINALITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-6 px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  opt.value === cardinality
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span className="text-sm font-medium">{opt.description}</span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  opt.value === cardinality ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500'
                }`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
