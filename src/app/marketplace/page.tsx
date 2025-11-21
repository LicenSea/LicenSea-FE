"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/Marketplace/ProductCard";
import { FilterPanel } from "@/components/Marketplace/FilterPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import type { FilterOptions } from "@/types/work";
import { useFetchWorks } from "@/lib/hooks/useFetchWorks";
import { mockWorks } from "@/data";

import lineageImg from "@/assets/lineage.png";
import type { Work } from "@/types/work";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    feeRange: [0, 1000],
    creator: undefined,
    title: undefined,
    isAdult: null,
    hasLicenseOptions: null,
  });

  const [sortBy] = useState<any>("relevance");
  const [viewMode] = useState<"grid" | "list">("grid");
  const { works: fetchedWorks, loading } = useFetchWorks();

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Supabase에서 받은 데이터를 Work 타입으로 변환
    const transformedWorks = fetchedWorks
      .map((work: any): Work | null => {
        if (!work) return null;

        return {
          id: work.work_id,
          creator: work.creator,
          fee: Number(work.fee) / 1_000_000_000, // MIST to SUI
          metadata: {
            title: work.title,
            description: work.description,
            file_type: work.file_type,
            file_size: work.file_size,
            tags: work.tags || [],
            category: work.category,
            isAdult: false, // Supabase에 없으면 기본값
          },
          preview_uri: work.preview_uri,
          licenseOption: work.license_rule
            ? {
                rule: work.license_rule,
                price: Number(work.license_price || 0) / 1_000_000_000,
                royaltyRatio: Number(work.royalty_ratio || 0),
              }
            : null,
          parentId: work.parent_id ? [work.parent_id] : null,
          blob_uri: work.blob_id || "",
        };
      })
      .filter((work): work is Work => work !== null);

    // 임시로 mockWorks 사용 (Indexer 데이터가 없을 때)
    console.log(transformedWorks);
    let result =
      transformedWorks.length > 0 ? transformedWorks : [...mockWorks];

    // Apply filters
    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.metadata.category)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((product) =>
        filters.tags!.some((tag) => product.metadata.tags?.includes(tag))
      );
    }

    result = result.filter(
      (product) =>
        product.fee >= filters.feeRange[0] && product.fee <= filters.feeRange[1]
    );

    if (filters.creator) {
      const creatorLower = filters.creator.toLowerCase();
      result = result.filter((product) =>
        product.creator.toLowerCase().includes(creatorLower)
      );
    }

    if (filters.title) {
      const titleLower = filters.title.toLowerCase();
      result = result.filter((product) =>
        product.metadata.title.toLowerCase().includes(titleLower)
      );
    }

    if (filters.isAdult !== null && filters.isAdult !== undefined) {
      result = result.filter(
        (product) => product.metadata.isAdult === filters.isAdult
      );
    }

    if (
      filters.hasLicenseOptions !== null &&
      filters.hasLicenseOptions !== undefined
    ) {
      result = result.filter((product) => {
        const hasLicense =
          product.licenseOption && product.licenseOption.rule !== "";
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
        break;
    }

    return result;
  }, [fetchedWorks, filters, sortBy]);

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div
        className="w-full mt-20 h-40 bg-black"
        style={{
          backgroundImage: `url(${lineageImg.src})`,
          backgroundRepeat: "repeat-x",
          backgroundPositionX: "center",
          backgroundSize: "contain",
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="hidden lg:block flex-shrink-0">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4 font-galmuri">
                <div>Works ({filteredAndSortedProducts.length})</div>

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
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">
                  Loading works from the chain...
                </p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
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
