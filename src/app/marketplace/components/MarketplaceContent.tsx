import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/Marketplace/FilterPanel";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { WorksGrid } from "./WorksGrid";
import type { FilterOptions } from "@/types/work";
import type { Work } from "@/types/work";

interface MarketplaceContentProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  works: Work[];
  loading: boolean;
  viewMode?: "grid" | "list";
  onClearFilters: () => void;
}

export const MarketplaceContent = ({
  filters,
  onFiltersChange,
  works,
  loading,
  viewMode = "grid",
  onClearFilters,
}: MarketplaceContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block flex-shrink-0">
          <FilterPanel filters={filters} onFiltersChange={onFiltersChange} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 font-galmuri">
              <div>Works ({works.length})</div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={onFiltersChange}
                      isMobile={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Works Display */}
          {loading ? (
            <LoadingState />
          ) : works.length === 0 ? (
            <EmptyState onClearFilters={onClearFilters} />
          ) : (
            <WorksGrid works={works} viewMode={viewMode} />
          )}
        </div>
      </div>
    </div>
  );
};
