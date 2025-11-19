import { useState, useMemo } from "react";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import { FilterPanel } from "@/components/Marketplace/FilterPanel";
import {
  SortDropdown,
  type SortOption,
} from "@/components/Marketplace/SortDropdown";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Grid, List } from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { mockWorks } from "@/data";
import type { FilterOptions } from "@/types/work";

import lineageImg from "@/assets/lineage.png";

export function Marketplace() {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    feeRange: [0, 1000],
    creator: undefined,
    title: undefined,
    isAdult: null,
    hasLicenseOptions: null,
  });

  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...mockWorks];

    // Apply filters
    // Categories filter
    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.metadata.category)
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((product) =>
        filters.tags!.some((tag) => product.metadata.tags?.includes(tag))
      );
    }

    // Price range filter
    result = result.filter(
      (product) =>
        product.fee >= filters.feeRange[0] && product.fee <= filters.feeRange[1]
    );

    // Creator filter
    if (filters.creator) {
      const creatorLower = filters.creator.toLowerCase();
      result = result.filter((product) =>
        product.creator.toLowerCase().includes(creatorLower)
      );
    }

    // Title filter
    if (filters.title) {
      const titleLower = filters.title.toLowerCase();
      result = result.filter((product) =>
        product.metadata.title.toLowerCase().includes(titleLower)
      );
    }

    // isAdult filter
    if (filters.isAdult !== null && filters.isAdult !== undefined) {
      result = result.filter(
        (product) => product.metadata.isAdult === filters.isAdult
      );
    }

    // licenseOptions filter
    if (
      filters.hasLicenseOptions !== null &&
      filters.hasLicenseOptions !== undefined
    ) {
      result = result.filter((product) => {
        const hasLicense = !!product.licenseOption;
        return hasLicense === filters.hasLicenseOptions;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.fee - b.fee);
        break;
      case "price-high-low":
        result.sort((a, b) => b.fee - a.fee);
        break;
      case "name":
        result.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
        break;
      default:
        // relevance - keep original order
        break;
    }

    return result;
  }, [filters, sortBy]);

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div
        className="w-full mt-20 h-40 bg-black"
        style={{
          backgroundImage: `url(${lineageImg})`,
          backgroundRepeat: "repeat-x",
          backgroundPositionX: "center",
          backgroundSize: "contain",
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop Filter Panel */}
          <div className="hidden lg:block flex-shrink-0">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4 font-galmuri">
                <div>Works ({filteredAndSortedProducts.length})</div>

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
                        onFiltersChange={setFilters}
                        isMobile={true}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                {/* <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div> */}

                {/* Sort Dropdown */}
                {/* <SortDropdown value={sortBy} onChange={setSortBy} /> */}
              </div>
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No works found matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      categories: [],
                      tags: [],
                      feeRange: [0, 1000],
                      creator: undefined,
                      title: undefined,
                      isAdult: null,
                      hasLicenseOptions: null,
                    })
                  }
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
