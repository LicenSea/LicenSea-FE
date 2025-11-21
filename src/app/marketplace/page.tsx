"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { MarketplaceHeader } from "./components/MarketplaceHeader";
import { MarketplaceContent } from "./components/MarketplaceContent";
import { useFetchWorks } from "@/lib/hooks/useFetchWorks";
import { useWorksTransform } from "./hooks/useWorksTransform";
import { useFilteredWorks } from "./hooks/useFilteredWorks";
import type { FilterOptions } from "@/types/work";

const defaultFilters: FilterOptions = {
  categories: [],
  tags: [],
  feeRange: [0, 1000],
  creator: undefined,
  title: undefined,
  isAdult: null,
  hasLicenseOptions: null,
};

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [sortBy] = useState<
    "relevance" | "price-low-high" | "price-high-low" | "name"
  >("relevance");
  const [viewMode] = useState<"grid" | "list">("grid");

  const { works: fetchedWorks, loading } = useFetchWorks();
  const transformedWorks = useWorksTransform(fetchedWorks);

  const works = transformedWorks.length > 0 ? transformedWorks : [];

  const filteredWorks = useFilteredWorks({
    works,
    filters,
    sortBy,
  });

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <MarketplaceHeader />
      <MarketplaceContent
        filters={filters}
        onFiltersChange={setFilters}
        works={filteredWorks}
        loading={loading}
        viewMode={viewMode}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
