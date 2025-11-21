import { useRouter } from "next/navigation";
import { Upload, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import type { Work } from "@/types/work";

interface MyWorksTabProps {
  myWorks: Work[];
  originalWorks: Work[];
  derivativeWorks: Work[];
}

export const MyWorksTab = ({
  myWorks,
  originalWorks,
  derivativeWorks,
}: MyWorksTabProps) => {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Works</h2>
          <p className="text-muted-foreground">
            {myWorks.length} {myWorks.length === 1 ? "work" : "works"} uploaded
          </p>
        </div>
        <Button onClick={() => router.push("/upload")}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New Work
        </Button>
      </div>

      {myWorks.length > 0 ? (
        <div className="space-y-8">
          {/* 원본 작품 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Original Works</h3>
                <p className="text-sm text-muted-foreground">
                  {originalWorks.length}{" "}
                  {originalWorks.length === 1 ? "work" : "works"}
                </p>
              </div>
            </div>
            {originalWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {originalWorks.map((work) => (
                  <ProductCard key={work.id} product={work} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No original works yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 파생 작품 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Derivative Works</h3>
                <p className="text-sm text-muted-foreground">
                  {derivativeWorks.length}{" "}
                  {derivativeWorks.length === 1 ? "work" : "works"}
                </p>
              </div>
              {derivativeWorks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/upload");
                  }}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Create New Derivative
                </Button>
              )}
            </div>
            {derivativeWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {derivativeWorks.map((work) => (
                  <ProductCard key={work.id} product={work} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No derivative works yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/upload");
                    }}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Create Derivative Work
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No works yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating and uploading your first work
            </p>
            <Button onClick={() => router.push("/upload")}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Work
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
