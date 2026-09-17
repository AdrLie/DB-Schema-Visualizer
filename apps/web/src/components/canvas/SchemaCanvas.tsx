'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, MiniMap, Panel, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { schemaToReactFlow, getLayoutedElements } from '@/lib/react-flow-adapter';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Search, Plus, LayoutGrid } from 'lucide-react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toastManager } from '../ui/Toast';

function ExportListener() {
  const { getNodes } = useReactFlow();

  useEffect(() => {
    const handleExport = async (e: any) => {
      const { fmt, diagramName, onComplete } = e.detail;
      try {
        const el = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!el) throw new Error('Canvas not found');
        
        toastManager.addToast(`Generating ${fmt.toUpperCase()}…`, 'info');
        
        // Wait for React to paint the toast and dropdown spinner before freezing main thread
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const nodesBounds = getNodesBounds(getNodes());
        const imageWidth = nodesBounds.width + 100;
        const imageHeight = nodesBounds.height + 100;
        const transform = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0);
        
        const style = {
          width: imageWidth + 'px',
          height: imageHeight + 'px',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        };
        
        const dl = (url: string, ext: string) => { 
          const a = document.createElement('a'); a.href = url; 
          a.download = `${(diagramName.trim() || 'Untitled')}.${ext}`; 
          a.click(); 
          toastManager.addToast(`Exported as ${ext.toUpperCase()}`, 'success'); 
        };

        if (fmt === 'png') {
          dl(await toPng(el, { backgroundColor: '#eef5e0', width: imageWidth, height: imageHeight, style, skipFonts: true }), 'png');
        } else if (fmt === 'svg') {
          dl(await toSvg(el, { backgroundColor: '#eef5e0', width: imageWidth, height: imageHeight, style, skipFonts: true }), 'svg');
        } else {
          const url = await toPng(el, { backgroundColor: '#eef5e0', width: imageWidth, height: imageHeight, style, skipFonts: true });
          const pdf = new jsPDF({ orientation: imageWidth > imageHeight ? 'landscape' : 'portrait', unit: 'px', format: [imageWidth, imageHeight] });
          pdf.addImage(url, 'PNG', 0, 0, imageWidth, imageHeight);
          pdf.save(`${diagramName.trim() || 'Untitled'}.pdf`);
          toastManager.addToast('Exported as PDF', 'success');
        }
      } catch (err) {
        console.error(err);
        toastManager.addToast('Export failed', 'error');
      } finally {
        if (onComplete) onComplete();
      }
    };
    
    window.addEventListener('export-image', handleExport);
    return () => window.removeEventListener('export-image', handleExport);
  }, [getNodes]);

  return null;
}

type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

export function SchemaCanvas({ schema, onEditTable, onAddTable, onDeleteTable, cardinalityMap, onCardinalityChange }: {
  schema: DatabaseSchema; onEditTable?: (n: string) => void; onAddTable?: () => void; onDeleteTable?: (n: string) => void;
  cardinalityMap?: Record<string, Cardinality>; onCardinalityChange?: (id: string, c: Cardinality) => void;
}) {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => schemaToReactFlow(schema, cardinalityMap, onCardinalityChange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, searchQuery } })));
  }, [searchQuery, setNodes]);

  useEffect(() => {
    const { nodes: nNodes, edges: nEdges } = schemaToReactFlow(schema, cardinalityMap, onCardinalityChange);
    setNodes(prev => nNodes.map(n => { 
      const ex = prev.find(p => p.id === n.id); 
      return { 
        ...(ex ? { ...n, position: ex.position } : n), 
        data: { ...n.data, searchQuery, onDeleteTable } 
      }; 
    }));
    setEdges(nEdges);
  }, [schema, cardinalityMap, onCardinalityChange, setNodes, setEdges, searchQuery, onDeleteTable]);

  const onConnect = useCallback((p: Connection | Edge) => setEdges(eds => addEdge(p, eds)), [setEdges]);
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, n: Node) => { if (n.type === 'table' && onEditTable) onEditTable(n.id); }, [onEditTable]);
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationship: RelationshipEdge }), []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView className="bg-transparent" minZoom={0.1} maxZoom={1.5}
      >
        <Panel position="top-center" className="mt-4 flex gap-2.5 items-center flex-wrap justify-center px-4">
          {/* Search bar */}
          <div className="flex items-center rounded-full px-4 py-2 w-80 max-w-full transition-all"
            style={{ background: 'rgba(233,245,219,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(113,131,85,0.2)', boxShadow: '0 4px 16px rgba(42,61,24,0.08)' }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.45)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.2)'}>
            <Search className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: 'rgba(74,96,48,0.45)' }} />
            <input type="text" placeholder="Search tables…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="outline-none text-sm w-full font-sans bg-transparent placeholder:opacity-40"
              style={{ color: '#2a3d18' }} />
          </div>

          {/* Auto Layout */}
          <button onClick={() => { const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges); setNodes([...ln]); setEdges([...le]); }}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(233,245,219,0.9)', border: '1px solid rgba(113,131,85,0.22)', color: '#4a6030', backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(42,61,24,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(207,225,185,0.95)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.38)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,245,219,0.9)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.22)'; }}>
            <LayoutGrid className="w-4 h-4" />
            Auto Layout
          </button>

          {/* Add Table */}
          {onAddTable && (
            <button onClick={onAddTable}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#87986a,#718355)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 16px rgba(113,131,85,0.35)', backdropFilter: 'blur(12px)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}>
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          )}
        </Panel>

        <Controls
          style={{ background: 'rgba(233,245,219,0.92)', border: '1px solid rgba(113,131,85,0.18)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(42,61,24,0.08)' }}
          className="!fill-green-700"
        />
        <MiniMap
          zoomable pannable
          nodeColor={() => '#b5c99a'}
          className="!rounded-xl !overflow-hidden !shadow-md"
          style={{ background: 'rgba(233,245,219,0.92)', border: '1px solid rgba(113,131,85,0.18)' }}
          maskColor="rgba(250,250,247,0.75)"
        />
        <Background gap={16} size={1.5} color="rgba(113,131,85,0.1)" />
        <ExportListener />
      </ReactFlow>
    </div>
  );
}
