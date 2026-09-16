'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, MiniMap, Panel, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { schemaToReactFlow, getLayoutedElements } from '@/lib/react-flow-adapter';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Search, Plus, LayoutGrid } from 'lucide-react';

type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

export function SchemaCanvas({ schema, onEditTable, onAddTable, cardinalityMap, onCardinalityChange }: {
  schema: DatabaseSchema; onEditTable?: (n: string) => void; onAddTable?: () => void;
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
    setNodes(prev => nNodes.map(n => { const ex = prev.find(p => p.id === n.id); return ex ? { ...n, position: ex.position } : n; }));
    setEdges(nEdges);
  }, [schema, cardinalityMap, onCardinalityChange, setNodes, setEdges]);

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
            style={{ background: 'rgba(24,13,6,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(176,137,104,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.35)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.15)'}>
            <Search className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: 'rgba(176,137,104,0.5)' }} />
            <input type="text" placeholder="Search tables…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="outline-none text-sm w-full font-sans bg-transparent placeholder:opacity-30"
              style={{ color: '#ede0d4' }} />
          </div>

          {/* Auto Layout */}
          <button onClick={() => { const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges); setNodes([...ln]); setEdges([...le]); }}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(176,137,104,0.15)', border: '1px solid rgba(176,137,104,0.25)', color: '#ddb892', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.22)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(176,137,104,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.15)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; }}>
            <LayoutGrid className="w-4 h-4" />
            Auto Layout
          </button>

          {/* Add Table */}
          {onAddTable && (
            <button onClick={onAddTable}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#9c6644,#7f5539)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 16px rgba(127,85,57,0.35)', backdropFilter: 'blur(12px)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}>
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          )}
        </Panel>

        <Controls
          style={{ background: 'rgba(28,16,9,0.9)', border: '1px solid rgba(176,137,104,0.15)', backdropFilter: 'blur(12px)' }}
          className="!fill-amber-800"
        />
        <MiniMap
          zoomable pannable
          nodeColor={() => '#9c6644'}
          className="!rounded-xl !overflow-hidden !shadow-2xl"
          style={{ background: 'rgba(28,16,9,0.9)', border: '1px solid rgba(176,137,104,0.15)' }}
          maskColor="rgba(18,10,5,0.75)"
        />
        <Background gap={16} size={1.5} color="rgba(176,137,104,0.06)" />
      </ReactFlow>
    </div>
  );
}
