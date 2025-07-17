/**
 * Graph visualization component using React Flow
 * @module Graph
 */
import React, { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { graphData } from "../data/nodes";
import { AlertTriangle, Settings } from "lucide-react";
import { getColorByAlertCount, baseTypeToIcon } from "../utils.jsx";
import AWSIcon from "./AWSIcon";

/**
 * Mapping of node types to their respective icons, including AWS.
 * @type {Object.<string, JSX.Element>}
 */
const typeToIcon = {
  ...baseTypeToIcon,
  aws: <AWSIcon />,
};

/**
 * Custom node component for React Flow.
 * @param {Object} props
 * @param {Object} props.data - Node data.
 * @returns {JSX.Element}
 */
const Node = ({ data }) => {
  const { label, alerts, misconfigs, type, collapsed, toggleCollapse, hasChildren, children, filter } = data;
  const collapsedCount = children?.length || 0;
  return (
    <div
      className="graph-node"
      title={`Alerts: ${alerts}\nMisconfigs: ${misconfigs}`}
      style={{
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 8,
        backgroundColor: getColorByAlertCount(alerts),
        color: "white",
        width: 150,
        height: 100,
        textAlign: "center",
        cursor: hasChildren ? "pointer" : "default",
        position: "relative",
        transition: "all 0.3s ease",
        boxShadow: collapsed ? "2px 2px 6px rgba(0,0,0,0.2)" : "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
      }}
      onClick={() => hasChildren && toggleCollapse(data.id)}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {typeToIcon[type]}
        <span>{label}</span>
      </div>
      {(!filter || filter === 'all' || filter === 'alerts') && (
        <div><AlertTriangle size={14} /> {alerts}</div>
      )}
      {(!filter || filter === 'all' || filter === 'misconfigs') && (
        <div><Settings size={14} /> {misconfigs}</div>
      )}
      {hasChildren && (
        <div style={{ fontWeight: "bold" }}>
          {collapsed ? `+${collapsedCount}` : "  "}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
};

// Dagre graph setup for layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 160;
const nodeHeight = 100;

/**
 * Layout the graph nodes and edges using Dagre.
 * @param {Array} nodes
 * @param {Array} edges
 * @param {string} direction - 'TB' (top-bottom) or 'LR' (left-right)
 * @returns {Array} positioned nodes
 */
const layoutGraph = (nodes, edges, direction = "TB") => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: direction === 'LR' ? 60 : 30, ranksep: direction === 'LR' ? 80 : 50 });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      sourcePosition: direction === 'LR' ? "right" : "bottom",
      targetPosition: direction === 'LR' ? "left" : "top",
    };
  });
};

const Legend = ({ filter, setFilter }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    padding: '10px 18px',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
    fontSize: 15,
    fontWeight: 500
  }}>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: filter === 'all' ? 1 : 0.7, borderBottom: filter === 'all' ? '2px solid #222' : 'none' }}
      onClick={() => setFilter('all')}
      title="Show all"
    >
      <span style={{ fontWeight: 600, fontSize: 16 }}>All</span>
    </span>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: filter === 'alerts' ? 1 : 0.7, borderBottom: filter === 'alerts' ? '2px solid #ff6b6b' : 'none' }}
      onClick={() => setFilter(filter === 'alerts' ? 'all' : 'alerts')}
      title="Show only alerts"
    >
      <AlertTriangle size={18} color="#ff6b6b" /> Alerts
    </span>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: filter === 'misconfigs' ? 1 : 0.7, borderBottom: filter === 'misconfigs' ? '2px solid #0074D9' : 'none' }}
      onClick={() => setFilter(filter === 'misconfigs' ? 'all' : 'misconfigs')}
      title="Show only misconfigurations"
    >
      <Settings size={18} color="#0074D9" /> Misconfigurations
    </span>
  </div>
);

/**
 * Main Graph component rendering the cloud graph visualization.
 * @returns {JSX.Element}
 */
const Graph = () => {
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [filter, setFilter] = useState('all');

  // Detect mobile screen
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;
  const layoutDirection = isMobile ? 'LR' : 'TB';

  // Toggle collapse state for a node
  const toggleCollapse = useCallback((id) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Build visible nodes and edges based on collapse state
  const buildGraph = useCallback(() => {
    const visibleNodes = [];
    const visibleEdges = [];
    const visited = new Set();
    const dfs = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = graphData.nodes.find((n) => n.id === id);
      const hasChildren = node.children && node.children.length > 0;
      visibleNodes.push({
        id: node.id,
        data: {
          ...node,
          collapsed: collapsedNodes[node.id],
          hasChildren,
          toggleCollapse,
          filter,
        },
        type: "custom",
      });
      if (!collapsedNodes[id] && hasChildren) {
        node.children.forEach((childId) => {
          visibleEdges.push({
            id: `${id}-${childId}`,
            source: id,
            target: childId,
            animated: true,
            style: { stroke: '#222' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#222',
            },
          });
          dfs(childId);
        });
      }
    };
    dfs("cloud");
    const positionedNodes = layoutGraph(visibleNodes, visibleEdges, layoutDirection);
    return { visibleNodes: positionedNodes, visibleEdges };
  }, [collapsedNodes, toggleCollapse, layoutDirection, filter]);

  const { visibleNodes, visibleEdges } = useMemo(() => buildGraph(), [buildGraph]);
  const nodeTypes = useMemo(() => ({ custom: Node }), []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflowX: isMobile ? "auto" : "hidden", position: 'relative' }}>
      <Legend filter={filter} setFilter={setFilter} />
      <ReactFlowProvider>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          zoomOnScroll
        >
          <MiniMap style={isMobile ? { width: 80, height: 60 } : {}} />
          <Controls style={isMobile ? { transform: 'scale(0.8)' } : {}} />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default Graph;

