import { Button } from "@/components/ui/button";
import type { FilterOptions } from "@/types/work";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        No works found matching your filters.
      </p>
      <Button variant="outline" onClick={onClearFilters} className="mt-4">
        Clear Filters
      </Button>
    </div>
  );
};
