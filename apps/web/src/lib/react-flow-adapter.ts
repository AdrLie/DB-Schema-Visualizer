import { DatabaseSchema } from '@schemaflow/schema-core';
import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

export function schemaToReactFlow(
  schema: DatabaseSchema,
  cardinalityMap: Record<string, 'one-to-one' | 'one-to-many' | 'many-to-many'> = {},
  onCardinalityChange?: (edgeId: string, cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many') => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  schema.tables.forEach((table) => {
    nodes.push({
      id: table.name,
      type: 'table',
      position: { x: 0, y: 0 },
      data: { table },
    });
  });

  schema.relationships.forEach((rel) => {
    const cardinality = cardinalityMap[rel.id] || rel.cardinality || 'one-to-many';
    edges.push({
      id: rel.id,
      source: rel.sourceTable,
      target: rel.targetTable,
      type: 'relationship',
      data: { cardinality, onCardinalityChange },
    });
  });

  return getLayoutedElements(nodes, edges);
}

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 300;
  const nodeHeight = 250;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
}

