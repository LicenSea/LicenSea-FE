import { useState, useEffect } from "react";
import type { TreeNode } from "../types";
import type { Work } from "@/types/work";

interface UseDerivativeTreesProps {
  activeTab: string;
  originalWorks: Work[];
}

export const useDerivativeTrees = ({
  activeTab,
  originalWorks,
}: UseDerivativeTreesProps) => {
  const [derivativeTrees, setDerivativeTrees] = useState<TreeNode[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 재귀적으로 자식 작품들을 가져오는 함수
  const fetchChildrenRecursively = async (
    workId: string,
    visited: Set<string> = new Set()
  ): Promise<TreeNode[]> => {
    if (visited.has(workId)) {
      return []; // 순환 참조 방지
    }
    visited.add(workId);

    try {
      const response = await fetch(`/api/lineage/${workId}`);
      const data = await response.json();

      if (!data.children || data.children.length === 0) {
        return [];
      }

      const children: TreeNode[] = [];
      for (const child of data.children) {
        const childNode: TreeNode = {
          work: {
            id: child.work_id,
            title: child.title,
            creator: child.creator,
            preview_uri: child.preview_uri,
            created_at: child.created_at,
          },
          children: await fetchChildrenRecursively(child.work_id, visited),
        };
        children.push(childNode);
      }

      return children;
    } catch (error) {
      console.error(`Error fetching children for ${workId}:`, error);
      return [];
    }
  };

  // 원본 작품들의 트리 구조 생성
  useEffect(() => {
    if (activeTab !== "derivatives" || originalWorks.length === 0) {
      return;
    }

    const loadTrees = async () => {
      setLoadingTrees(true);
      try {
        const trees: TreeNode[] = [];

        for (const originalWork of originalWorks) {
          const children = await fetchChildrenRecursively(originalWork.id);
          if (children.length > 0) {
            trees.push({
              work: {
                id: originalWork.id,
                title: originalWork.metadata.title,
                creator: originalWork.creator,
                preview_uri: originalWork.preview_uri,
              },
              children,
            });
            // 루트 노드는 기본적으로 확장
            setExpandedNodes((prev) => new Set(prev).add(originalWork.id));
          }
        }

        setDerivativeTrees(trees);
      } catch (error) {
        console.error("Error loading derivative trees:", error);
      } finally {
        setLoadingTrees(false);
      }
    };

    loadTrees();
  }, [activeTab, originalWorks]);

  const toggleExpand = (workId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(workId)) {
        next.delete(workId);
      } else {
        next.add(workId);
      }
      return next;
    });
  };

  return {
    derivativeTrees,
    loadingTrees,
    expandedNodes,
    toggleExpand,
  };
};
