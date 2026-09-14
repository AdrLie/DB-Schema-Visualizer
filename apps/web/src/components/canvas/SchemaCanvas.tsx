'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DatabaseSchema } from '@schemaflow/schema-core';
import { schemaToReactFlow, getLayoutedElements } from '@/lib/react-flow-adapter';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Search, Plus } from 'lucide-react';

type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

export function SchemaCanvas({
  schema,
  onEditTable,
  onAddTable,
  cardinalityMap,
  onCardinalityChange,
}: {
  schema: DatabaseSchema;
  onEditTable?: (tableName: string) => void;
  onAddTable?: () => void;
  cardinalityMap?: Record<string, Cardinality>;
  onCardinalityChange?: (edgeId: string, cardinality: Cardinality) => void;
}) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => schemaToReactFlow(schema, cardinalityMap, onCardinalityChange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, searchQuery },
      }))
    );
  }, [searchQuery, setNodes]);

  // Update nodes/edges when schema or cardinality changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = schemaToReactFlow(schema, cardinalityMap, onCardinalityChange);

    setNodes((prevNodes) =>
      newNodes.map(newNode => {
        const existing = prevNodes.find(n => n.id === newNode.id);
        return existing ? { ...newNode, position: existing.position } : newNode;
      })
    );
    setEdges(newEdges);
  }, [schema, cardinalityMap, onCardinalityChange, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'table' && onEditTable) onEditTable(node.id);
  }, [onEditTable]);

  const nodeTypes = useMemo(() => ({ table: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationship: RelationshipEdge }), []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Panel position="top-center" className="mt-4 flex gap-3">
          <div className="flex items-center bg-slate-900/60 backdrop-blur-xl rounded-full shadow-2xl shadow-black/50 border border-white/10 px-4 py-2.5 w-96 transition-all focus-within:bg-slate-900/80 focus-within:border-indigo-500/50">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search tables..."
              className="outline-none text-sm w-full font-sans bg-transparent text-slate-200 placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
              setNodes([...ln]);
              setEdges([...le]);
            }}
            className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-sm font-medium text-white px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            Auto Layout
          </button>
          {onAddTable && (
            <button
              onClick={onAddTable}
              className="flex items-center justify-center gap-1.5 bg-emerald-500/90 hover:bg-emerald-400 text-sm font-medium text-white px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 border border-white/10"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          )}
        </Panel>
        <Controls className="!bg-slate-900/80 !border-white/10 !backdrop-blur-md !fill-slate-300" />
        <MiniMap
          zoomable
          pannable
          nodeClassName="!fill-indigo-500/50 !stroke-indigo-400"
          className="!bg-slate-900/80 !border-white/10 !backdrop-blur-md rounded-xl overflow-hidden shadow-2xl"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
        <Background gap={16} size={2} color="rgba(255, 255, 255, 0.04)" />
      </ReactFlow>
    </div>
  );
}
