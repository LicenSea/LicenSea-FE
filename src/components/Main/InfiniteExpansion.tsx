import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  connections: number[];
  depth: number;
}

const InfiniteExpansion = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const centerX = dimensions.width / 4;
    const centerY = dimensions.height / 4;
    const initialNodes: Node[] = [];
    const maxDepth = 4;
    const nodesPerLevel = [1, 6, 12, 18, 24, 30];
    let nodeId = 0;

    // 중앙 노드
    initialNodes.push({
      id: nodeId++,
      x: centerX,
      y: centerY,
      size: 28,
      connections: [],
      depth: 0,
    });

    // 각 레벨별로 노드 생성
    for (let depth = 1; depth <= maxDepth; depth++) {
      const radius = depth * 50;
      const count = nodesPerLevel[depth] || 24;
      const angleStep = (2 * Math.PI) / count;

      for (let i = 0; i < count; i++) {
        const angle = i * angleStep + depth * 0.1; // 약간의 회전 추가
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        initialNodes.push({
          id: nodeId++,
          x,
          y,
          size: Math.max(16, 14 - depth * 1.2),
          connections: [],
          depth,
        });
      }
    }

    // 연결 관계 설정 (각 노드는 이전 레벨의 노드들과 연결)
    initialNodes.forEach((node, index) => {
      if (node.depth === 0) return;

      const prevLevelNodes = initialNodes.filter(
        (n) => n.depth === node.depth - 1
      );

      // 가장 가까운 2-3개의 이전 레벨 노드와 연결
      const sorted = prevLevelNodes
        .map((n) => ({
          node: n,
          distance: Math.sqrt(
            Math.pow(node.x - n.x, 2) + Math.pow(node.y - n.y, 2)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.min(3, prevLevelNodes.length));

      node.connections = sorted.map((s) => s.node.id);
    });

    setNodes(initialNodes);
  }, [dimensions]);

  const getNodeColor = (depth: number) => {
    if (depth === 0) return "#a3f9d8";
    const ratio = depth / 4;
    if (ratio < 0.5) {
      return `rgba(163, 249, 216, ${1 - ratio * 1.5})`;
    } else {
      return `rgba(230, 252, 115, ${(ratio - 0.5) * 2})`;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[-50]"
      style={{ minHeight: "400px" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* 연결선 그리기 */}
        {nodes.map((node) =>
          node.connections.map((connId, idx) => {
            const connectedNode = nodes.find((n) => n.id === connId);
            if (!connectedNode) return null;

            return (
              <motion.line
                key={`${node.id}-${connId}-${idx}`}
                x1={node.x}
                y1={node.y}
                x2={connectedNode.x}
                y2={connectedNode.y}
                stroke={getNodeColor(node.depth)}
                strokeWidth={1}
                strokeOpacity={0.3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: [0, 0.3, 0.2],
                }}
                transition={{
                  duration: 2,
                  delay: node.depth * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            );
          })
        )}

        {/* 노드 그리기 */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill={getNodeColor(node.depth)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 0.9, 0.7],
              x: [node.x, node.x + (Math.random() - 0.5) * 8, node.x],
              y: [node.y, node.y + (Math.random() - 0.5) * 8, node.y],
            }}
            transition={{
              scale: {
                duration: 1.5,
                delay: node.depth * 0.15,
                ease: "easeOut",
              },
              opacity: {
                duration: 1.5,
                delay: node.depth * 0.15,
              },
              x: {
                duration: 4 + node.depth * 0.5,
                delay: node.depth * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 4 + node.depth * 0.5,
                delay: node.depth * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </svg>

      {/* 글로우 효과를 위한 추가 레이어 */}
      {/* <div className="absolute inset-0">
        {nodes
          .filter((node) => node.depth <= 2)
          .map((node) => (
            <motion.div
              key={`glow-${node.id}`}
              className="absolute rounded-full blur-xl"
              style={{
                left: node.x,
                top: node.y,
                width: node.size * 10,
                height: node.size * 10,
                backgroundColor: getNodeColor(node.depth),
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + node.depth,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
      </div> */}
    </div>
  );
};

export default InfiniteExpansion;
