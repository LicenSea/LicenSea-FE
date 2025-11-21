import { useRouter } from "next/navigation";
import { Layers, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeNodeComponent } from "./TreeNodeComponent";
import type { TreeNode } from "../types";
import type { Work } from "@/types/work";

interface DerivativesTabProps {
  originalWorks: Work[];
  derivativeTrees: TreeNode[];
  loadingTrees: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (workId: string) => void;
}

export const DerivativesTab = ({
  originalWorks,
  derivativeTrees,
  loadingTrees,
  expandedNodes,
  onToggleExpand,
}: DerivativesTabProps) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Derivative Lineage</h2>
          <p className="text-muted-foreground">
            Tree view of works derived from your original works
          </p>
        </div>
        <Button
          onClick={() => {
            router.push("/upload");
          }}
        >
          <Layers className="w-4 h-4 mr-2" />
          Create New Derivative
        </Button>
      </div>

      {loadingTrees ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading derivative trees...</p>
          </CardContent>
        </Card>
      ) : derivativeTrees.length > 0 ? (
        <div className="space-y-6">
          {derivativeTrees.map((tree) => (
            <Card key={tree.work.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span>Original Work</span>
                  <Badge variant="outline">
                    {tree.children.length}{" "}
                    {tree.children.length === 1 ? "derivative" : "derivatives"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* 루트 노드 */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border-2 border-primary/20 bg-primary/5"
                    onClick={() => router.push(`/work/${tree.work.id}`)}
                  >
                    {tree.work.preview_uri ? (
                      <img
                        src={tree.work.preview_uri}
                        alt={tree.work.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {tree.work.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {tree.work.creator.slice(0, 12)}...
                      </p>
                    </div>
                  </div>

                  {/* 자식 노드들 */}
                  {tree.children.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-muted">
                      {tree.children.map((child) => (
                        <TreeNodeComponent
                          key={child.work.id}
                          node={child}
                          level={0}
                          expandedNodes={expandedNodes}
                          onToggleExpand={onToggleExpand}
                          router={router}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No derivative works yet
            </h3>
            <p className="text-muted-foreground mb-6">
              {originalWorks.length === 0
                ? "Upload original works first to see derivative lineage"
                : "No works have been derived from your original works yet"}
            </p>
            <div className="flex gap-4 justify-center">
              {originalWorks.length === 0 ? (
                <Button onClick={() => router.push("/upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Original Work
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/marketplace")}
                  >
                    Browse Licenses
                  </Button>
                  <Button
                    onClick={() => {
                      router.push("/upload");
                    }}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Create Derivative
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
