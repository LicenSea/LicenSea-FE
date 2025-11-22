import { Package, ChevronRight, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TreeNode } from "../types";
import { Button } from "@/components/ui/button";

interface TreeNodeComponentProps {
  node: TreeNode;
  level?: number;
  expandedNodes: Set<string>;
  onToggleExpand: (workId: string) => void;
  router: {
    push: (href: string) => void;
  };
  onRevoke?: (workId: string, capId: string) => void;
  isDirectChild?: boolean; // 직속 파생작인지 확인
  currentUser?: string; // 현재 사용자 주소
  capId?: string;
}

export const TreeNodeComponent = ({
  node,
  level = 0,
  expandedNodes,
  onToggleExpand,
  router,
  onRevoke,
  isDirectChild = false,
  currentUser,
  capId,
}: TreeNodeComponentProps) => {
  const isExpanded = expandedNodes.has(node.work.id);
  const hasChildren = node.children.length > 0;
  const indent = level * 24;
  const isMyWork = currentUser && node.work.creator === currentUser; // 내가 만든 작품인지 확인
  const canRevoke = isDirectChild && capId && !node.work.revoked; // 직속 파생작이고 Cap이 있고 아직 revoke되지 않은 경우

  return (
    <div className="mb-2">
      <div
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => router.push(`/work/${node.work.id}`)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.work.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {node.work.preview_uri ? (
            <img
              src={node.work.preview_uri}
              alt={node.work.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{node.work.title}</p>
              {isMyWork && <Badge variant="default">My Work</Badge>}
              {node.work.revoked && (
                <Badge variant="destructive">Revoked</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {node.work.creator.slice(0, 8)}...
            </p>
          </div>
          {hasChildren && (
            <Badge variant="secondary" className="flex-shrink-0">
              {node.children.length}
            </Badge>
          )}
          {canRevoke && onRevoke && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRevoke(node.work.id, capId!);
              }}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              Revoke
            </Button>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.work.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
};
