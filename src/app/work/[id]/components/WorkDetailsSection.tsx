import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/data";
import type { Work } from "@/types/work";

interface WorkDetailsSectionProps {
  work: Work;
}

const shortenAddress = (address: string, start = 8, end = 6): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const WorkDetailsSection = ({ work }: WorkDetailsSectionProps) => {
  const categoryLabel =
    categories.find((c) => c.id === work.metadata.category)?.label ||
    work.metadata.category;

  return (
    <div className="flex flex-col gap-6">
      {/* 제목 및 크리에이터 */}
      <div>
        <div className="flex gap-4 items-center mb-4">
          <h1 className="text-3xl font-bold">{work.metadata.title}</h1>
          {work.metadata.isAdult && <Badge variant="destructive">18+</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Creator: </span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono">
              {shortenAddress(work.creator)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => {
                navigator.clipboard.writeText(work.creator);
              }}
              title="Copy address"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 카테고리 및 태그 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{categoryLabel}</Badge>
        {work.metadata.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      {/* 설명 */}
      {work.metadata.description && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {work.metadata.description}
          </p>
        </div>
      )}

      {/* 파일 정보 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">File Type:</span>
          <span className="font-medium">{work.metadata.file_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">File Size:</span>
          <span className="font-medium">
            {(work.metadata.file_size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">
            {work.fee > 0 ? `${work.fee} SUI` : "FREE"}
          </span>
        </div>
      </div>
    </div>
  );
};
