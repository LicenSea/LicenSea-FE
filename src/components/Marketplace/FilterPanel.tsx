import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import type { FilterOptions, Work } from "@/types/work";
import { categories, mockWorks } from "@/data";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onClose,
  isMobile = false,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    search: true,
    tags: false,
    content: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId);

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      feeRange: [value[0], value[1]],
    });
  };

  const handleCreatorChange = (value: string) => {
    onFiltersChange({
      ...filters,
      creator: value.trim() || undefined,
    });
  };

  const handleTitleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      title: value.trim() || undefined,
    });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...(filters.tags || []), tag]
      : (filters.tags || []).filter((t) => t !== tag);

    onFiltersChange({
      ...filters,
      tags: newTags,
    });
  };

  const handleIsAdultChange = (value: boolean | null) => {
    onFiltersChange({
      ...filters,
      isAdult: value,
    });
  };

  const handleHasLicenseOptionsChange = (value: boolean | null) => {
    onFiltersChange({
      ...filters,
      hasLicenseOptions: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      feeRange: [0, 1000],
      creator: undefined,
      title: undefined,
      isAdult: null,
      hasLicenseOptions: null,
    });
  };

  const filterCount =
    filters.categories.length +
    (filters.tags?.length || 0) +
    (filters.feeRange[0] > 0 || filters.feeRange[1] < 1000 ? 1 : 0) +
    (filters.creator ? 1 : 0) +
    (filters.title ? 1 : 0) +
    (filters.isAdult !== null && filters.isAdult !== undefined ? 1 : 0) +
    (filters.hasLicenseOptions !== null &&
    filters.hasLicenseOptions !== undefined
      ? 1
      : 0);

  const allTags = Array.from(
    new Set(mockWorks.flatMap((work: Work) => work.metadata.tags || []))
  ).sort();

  return (
    <Card
      className={`rounded-sm h-fit sticky top-20 ${
        isMobile ? "w-full" : "w-80"
      }`}
    >
      <CardHeader className="">
        <div className="flex items-center justify-between  h-9">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {filterCount > 0 && <span className="">{filterCount}</span>}
          </CardTitle>
          <div className="flex gap-1 ">
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="hover:bg-[#a3f9d8]"
              >
                Clear All
              </Button>
            )}
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Section */}
        <Collapsible
          open={openSections.search}
          onOpenChange={() => toggleSection("search")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center text-sm font-semibold w-full justify-between p-0 h-auto">
              <span>Search</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.search ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Creator</label>
              <Input
                type="text"
                value={filters.creator || ""}
                onChange={(e) => handleCreatorChange(e.target.value)}
                placeholder="Search by creator address..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Title</label>
              <Input
                type="text"
                value={filters.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Search by title..."
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Categories */}
        <Collapsible
          open={openSections.categories}
          onOpenChange={() => toggleSection("categories")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center text-sm font-semibold w-full justify-between p-0 h-auto">
              <span>Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.categories ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
                {/* <span className="text-xs text-muted-foreground">
                  {category.count}
                </span> */}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Tags */}
        <Collapsible
          open={openSections.tags}
          onOpenChange={() => toggleSection("tags")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center text-sm font-semibold w-full justify-between p-0 h-auto">
              <span>Tags</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.tags ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {allTags.map((tag) => (
              <div key={tag} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={(filters.tags || []).includes(tag)}
                    onCheckedChange={(checked) =>
                      handleTagChange(tag, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag}
                  </label>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible
          open={openSections.price}
          onOpenChange={() => toggleSection("price")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center text-sm font-semibold w-full justify-between p-0 h-auto">
              <span>Price Range</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.price ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <Slider
              value={filters.feeRange}
              onValueChange={handlePriceChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${filters.feeRange[0]}</span>
              <span>${filters.feeRange[1]}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Content Options */}
        <Collapsible
          open={openSections.content}
          onOpenChange={() => toggleSection("content")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center text-sm font-semibold w-full justify-between p-0 h-auto">
              <span>Content Options</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.content ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Adult Content</label>
              <div className="flex gap-2">
                <Button
                  variant={
                    filters.isAdult === null || filters.isAdult === undefined
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleIsAdultChange(null)}
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  variant={filters.isAdult === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleIsAdultChange(false)}
                  className="flex-1"
                >
                  Non-Adult
                </Button>
                <Button
                  variant={filters.isAdult === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleIsAdultChange(true)}
                  className="flex-1"
                >
                  Adult Only
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">License Option</label>
              <div className="flex gap-2">
                <Button
                  variant={
                    filters.hasLicenseOptions === null ||
                    filters.hasLicenseOptions === undefined
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleHasLicenseOptionsChange(null)}
                  className="flex-1"
                >
                  All
                </Button>
                {/* <Button
                  variant={
                    filters.hasLicenseOptions === false ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleHasLicenseOptionsChange(false)}
                  className="flex-1"
                >
                  Not for Sale
                </Button> */}
                <Button
                  variant={
                    filters.hasLicenseOptions === true ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleHasLicenseOptionsChange(true)}
                  className="flex-1"
                >
                  License for Sale
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
