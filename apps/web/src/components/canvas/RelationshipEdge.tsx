'use client';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

const CARDINALITY_OPTIONS = [
  { value: 'one-to-one'   as Cardinality, label: '1 — 1', source: '1', target: '1', description: 'One to One' },
  { value: 'one-to-many'  as Cardinality, label: '1 — N', source: '1', target: 'N', description: 'One to Many' },
  { value: 'many-to-many' as Cardinality, label: 'N — M', source: 'N', target: 'M', description: 'Many to Many' },
];

interface RelationshipEdgeProps extends EdgeProps {
  data?: { cardinality?: Cardinality; onCardinalityChange?: (id: string, c: Cardinality) => void };
}

export function RelationshipEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, data }: RelationshipEdgeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });

  const cardinality: Cardinality = data?.cardinality || 'one-to-many';
  const option = CARDINALITY_OPTIONS.find(o => o.value === cardinality) || CARDINALITY_OPTIONS[1];

  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12 });

  const handleLabelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerPos({ x: e.clientX, y: e.clientY });
    setShowPicker(v => !v);
  }, []);

  const handleSelect = useCallback((val: Cardinality) => { data?.onCardinalityChange?.(id, val); setShowPicker(false); }, [id, data]);

  const strokeColor = selected ? '#b08968' : 'rgba(176,137,104,0.2)';
  const strokeWidth = selected ? 2 : 1.5;

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: strokeColor, strokeWidth, strokeDasharray: cardinality === 'many-to-many' ? '6 3' : 'none', transition: 'stroke 0.2s, stroke-width 0.2s' }} />

      <EdgeLabelRenderer>
        {/* Source marker */}
        <div style={{ transform: `translate(-50%,-50%) translate(${sourceX + (labelX - sourceX) * 0.2}px,${sourceY + (labelY - sourceY) * 0.2}px)` }} className="absolute pointer-events-none nopan">
          <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded"
            style={{ color: 'rgba(176,137,104,0.5)', background: '#120a05' }}>{option.source}</span>
        </div>

        {/* Target marker */}
        <div style={{ transform: `translate(-50%,-50%) translate(${targetX + (labelX - targetX) * 0.2}px,${targetY + (labelY - targetY) * 0.2}px)` }} className="absolute pointer-events-none nopan">
          <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded"
            style={{ color: 'rgba(176,137,104,0.5)', background: '#120a05' }}>{option.target}</span>
        </div>

        {/* Center clickable label */}
        <div style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }} className="absolute nopan">
          <button onClick={handleLabelClick}
            className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
            style={selected
              ? { background: 'rgba(176,137,104,0.15)', borderColor: 'rgba(176,137,104,0.35)', color: '#ddb892', boxShadow: '0 0 12px rgba(176,137,104,0.2)' }
              : { background: 'rgba(18,10,5,0.95)', borderColor: 'rgba(176,137,104,0.12)', color: 'rgba(176,137,104,0.5)' }}>
            {option.label}
          </button>
        </div>
      </EdgeLabelRenderer>

      {/* Cardinality picker */}
      {showPicker && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowPicker(false)} />
          <div className="fixed z-[9999] p-1.5 rounded-2xl overflow-hidden"
            style={{ left: pickerPos.x, top: pickerPos.y + 8, transform: 'translateX(-50%)', background: 'linear-gradient(145deg,#1c1009,#120a05)', border: '1px solid rgba(176,137,104,0.15)', boxShadow: '0 0 0 1px rgba(176,137,104,0.06), 0 24px 48px rgba(0,0,0,0.7)' }}>
            <p className="text-[9px] font-semibold uppercase tracking-widest px-3 pt-2 pb-1.5" style={{ color: 'rgba(176,137,104,0.4)' }}>Relationship Type</p>
            {CARDINALITY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleSelect(opt.value)}
                className="w-full flex items-center justify-between gap-6 px-3 py-2.5 rounded-xl transition-all duration-150 text-left"
                style={{
                  background: opt.value === cardinality ? 'rgba(176,137,104,0.12)' : 'transparent',
                  color: opt.value === cardinality ? '#ddb892' : 'rgba(176,137,104,0.6)',
                }}
                onMouseEnter={e => { if (opt.value !== cardinality) { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e6ccb2'; } }}
                onMouseLeave={e => { if (opt.value !== cardinality) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.6)'; } }}>
                <span className="text-sm font-medium">{opt.description}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
                  style={{ background: opt.value === cardinality ? 'rgba(176,137,104,0.2)' : 'rgba(176,137,104,0.07)', color: opt.value === cardinality ? '#ddb892' : 'rgba(176,137,104,0.45)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
